const express = require('express');
const UserCollection = require('../models/Collection');
const Course = require('../models/Course');
const { CourseProgress } = require('../models/Progress');
const { validateCollectionItem, validateMongoId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @desc    Get user collection
// @route   GET /api/collections
// @access  Private
router.get('/', async (req, res) => {
  try {
    let userCollection = await UserCollection.findOne({ user: req.user._id });

    if (!userCollection) {
      // Get enrolled courses for this user
      const enrolledCourses = await CourseProgress.find({ user: req.user._id })
        .populate('course', 'name category')
        .select('course');

      // Create collection structure based on enrolled courses only
      const subjects = enrolledCourses.map(progress => {
        const course = progress.course;
        if (!course) return null;

        // Map course category to subject info
        const subjectMap = {
          'mathematics': { icon: '📐', color: 'bg-blue-50 border-blue-200' },
          'physics': { icon: '⚛️', color: 'bg-purple-50 border-purple-200' },
          'chemistry': { icon: '🧪', color: 'bg-green-50 border-green-200' },
          'biology': { icon: '🧬', color: 'bg-red-50 border-red-200' },
          'english': { icon: '📚', color: 'bg-yellow-50 border-yellow-200' },
          'history': { icon: '🏛️', color: 'bg-orange-50 border-orange-200' },
          'computer-science': { icon: '💻', color: 'bg-indigo-50 border-indigo-200' }
        };

        const subjectInfo = subjectMap[course.category] || { icon: '📚', color: 'bg-gray-50 border-gray-200' };

        return {
          subjectId: course.category || course.name.toLowerCase().replace(/\s+/g, '-'),
          subjectName: course.name,
          icon: subjectInfo.icon,
          color: subjectInfo.color,
          lessons: [],
          totalItems: 0
        };
      }).filter(subject => subject !== null);

      // If no enrolled courses, return empty collection
      if (subjects.length === 0) {
        return res.status(200).json({
          success: true,
          data: { 
            collection: { 
              user: req.user._id, 
              subjects: [],
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }
        });
      }

      userCollection = await UserCollection.create({
        user: req.user._id,
        subjects: subjects
      });
    }

    // Filter existing collection to only show enrolled courses
    if (userCollection && userCollection.subjects) {
      const enrolledCourses = await CourseProgress.find({ user: req.user._id })
        .populate('course', 'name category')
        .select('course');

      const enrolledCourseNames = enrolledCourses
        .map(progress => progress.course?.name)
        .filter(name => name);

      // Filter subjects to only include enrolled courses
      userCollection.subjects = userCollection.subjects.filter(subject => 
        enrolledCourseNames.includes(subject.subjectName)
      );

      // Save the filtered collection
      await userCollection.save();
    }

    res.status(200).json({
      success: true,
      data: { collection: userCollection }
    });
  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching collection'
    });
  }
});

// @desc    Add item to collection
// @route   POST /api/collections/items
// @access  Private
router.post('/items', validateCollectionItem, async (req, res) => {
  try {
    const { title, type, subjectId, lessonId, content, metadata, customFolder } = req.body;

    let userCollection = await UserCollection.findOne({ user: req.user._id });
    
    if (!userCollection) {
      return res.status(404).json({
        success: false,
        message: 'User collection not found'
      });
    }

    const newItem = {
      title,
      type,
      content: content || {},
      metadata: metadata || {},
      source: 'uploaded',
      isFavorite: false,
      isPublic: false
    };

    await userCollection.addItem(subjectId, lessonId, newItem);

    res.status(201).json({
      success: true,
      message: 'Item added to collection successfully',
      data: { item: newItem }
    });
  } catch (error) {
    console.error('Add collection item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding item to collection'
    });
  }
});

// @desc    Update collection item
// @route   PUT /api/collections/items/:id
// @access  Private
router.put('/items/:id', validateMongoId('id'), async (req, res) => {
  try {
    const { title, isFavorite, tags } = req.body;

    const userCollection = await UserCollection.findOne({ user: req.user._id });
    
    if (!userCollection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    // Find and update the item across all subjects and lessons
    let itemFound = false;
    for (const subject of userCollection.subjects) {
      for (const lesson of subject.lessons) {
        for (const contentType of Object.keys(lesson.content)) {
          if (contentType === 'custom-folders') continue;
          
          const itemIndex = lesson.content[contentType].findIndex(
            item => item._id.toString() === req.params.id
          );
          
          if (itemIndex !== -1) {
            if (title) lesson.content[contentType][itemIndex].title = title;
            if (isFavorite !== undefined) lesson.content[contentType][itemIndex].isFavorite = isFavorite;
            if (tags) lesson.content[contentType][itemIndex].metadata.tags = tags;
            
            itemFound = true;
            break;
          }
        }
        if (itemFound) break;
      }
      if (itemFound) break;
    }

    if (!itemFound) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    await userCollection.save();

    res.status(200).json({
      success: true,
      message: 'Item updated successfully'
    });
  } catch (error) {
    console.error('Update collection item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating item'
    });
  }
});

// @desc    Delete collection item
// @route   DELETE /api/collections/items/:id
// @access  Private
router.delete('/items/:id', validateMongoId('id'), async (req, res) => {
  try {
    const userCollection = await UserCollection.findOne({ user: req.user._id });
    
    if (!userCollection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    // Find and remove the item
    let itemFound = false;
    for (const subject of userCollection.subjects) {
      for (const lesson of subject.lessons) {
        for (const contentType of Object.keys(lesson.content)) {
          if (contentType === 'custom-folders') continue;
          
          const itemIndex = lesson.content[contentType].findIndex(
            item => item._id.toString() === req.params.id
          );
          
          if (itemIndex !== -1) {
            lesson.content[contentType].splice(itemIndex, 1);
            lesson.totalItems -= 1;
            subject.totalItems -= 1;
            userCollection.stats.totalItems -= 1;
            itemFound = true;
            break;
          }
        }
        if (itemFound) break;
      }
      if (itemFound) break;
    }

    if (!itemFound) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    await userCollection.save();

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Delete collection item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting item'
    });
  }
});

// @desc    Create custom folder
// @route   POST /api/collections/folders
// @access  Private
router.post('/folders', async (req, res) => {
  try {
    const { name, description, color, icon, subjectId, lessonId } = req.body;

    if (!name || !subjectId || !lessonId) {
      return res.status(400).json({
        success: false,
        message: 'Name, subject, and lesson are required'
      });
    }

    const userCollection = await UserCollection.findOne({ user: req.user._id });
    
    if (!userCollection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    await userCollection.createCustomFolder(subjectId, lessonId, {
      name,
      description,
      color,
      icon
    });

    res.status(201).json({
      success: true,
      message: 'Custom folder created successfully'
    });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating folder'
    });
  }
});

// @desc    Add lesson to subject
// @route   POST /api/collections/lessons
// @access  Private
router.post('/lessons', async (req, res) => {
  try {
    const { subjectId, lessonName, lessonDescription } = req.body;

    if (!subjectId || !lessonName) {
      return res.status(400).json({
        success: false,
        message: 'Subject ID and lesson name are required'
      });
    }

    const userCollection = await UserCollection.findOne({ user: req.user._id });
    
    if (!userCollection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    const subject = userCollection.subjects.find(s => s.subjectId === subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const newLesson = {
      lessonId: new Date().getTime().toString(),
      lessonName,
      progress: 0,
      content: {
        'ai-notes': [],
        'user-notes': [],
        'ai-videos': [],
        'important-doubts': [],
        'custom-folders': {}
      },
      totalItems: 0,
      lastUpdated: new Date()
    };

    subject.lessons.push(newLesson);
    await userCollection.save();

    res.status(201).json({
      success: true,
      message: 'Lesson added successfully',
      data: { lesson: newLesson }
    });
  } catch (error) {
    console.error('Add lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding lesson'
    });
  }
});

module.exports = router;