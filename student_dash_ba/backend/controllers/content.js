// @desc    Get content for student's enrolled classes
// @route   GET /api/content
// @access  Private
exports.getContent = async (req, res, next) => {
  try {
    const { class: classId, subject, type, status } = req.query;
    const studentId = req.user._id;
    const studentEmail = req.user.email;

    console.log('📚 Fetching content for student:', {
      studentId: studentId.toString(),
      studentEmail,
      classId,
      subject,
      type,
      status
    });

    // Get student's enrolled classes from teacher backend
    const teacherApiUrl = process.env.TEACHER_API_URL || 'http://localhost:5001';
    
    try {
      // First, get student's classes - try with ID first, then email
      let enrolledClasses = [];
      
      // Try with student ID
      try {
        const classesResponse = await fetch(
          `${teacherApiUrl}/api/classes/student/${studentId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (classesResponse.ok) {
          const classesData = await classesResponse.json();
          enrolledClasses = classesData.data || (classesData.success ? (classesData.data || []) : []);
          console.log('✅ Found enrolled classes by ID:', enrolledClasses.length);
        }
      } catch (idError) {
        console.warn('⚠️ Could not fetch classes by ID, trying with email');
      }

      // If no classes found, try with email
      if (enrolledClasses.length === 0) {
        try {
          const emailResponse = await fetch(
            `${teacherApiUrl}/api/classes/student/${encodeURIComponent(studentEmail)}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (emailResponse.ok) {
            const emailData = await emailResponse.json();
            enrolledClasses = emailData.data || (emailData.success ? (emailData.data || []) : []);
            console.log('✅ Found enrolled classes by email:', enrolledClasses.length);
          }
        } catch (emailError) {
          console.warn('⚠️ Could not fetch classes by email either');
        }
      }

      // Build query for teacher backend
      const queryParams = new URLSearchParams();
      
      // Priority 1: If specific class ID provided, use it
      if (classId) {
        queryParams.append('class', classId);
      } 
      // Priority 2: Use all enrolled classes (this is the main source of content)
      else if (enrolledClasses.length > 0) {
        // Add all enrolled class IDs
        const classIds = enrolledClasses.map(cls => {
          // Handle different class object structures
          // enrolledClasses structure: [{ class: { _id: ..., name: ... }, joinedAt: ..., status: ... }]
          if (typeof cls === 'object') {
            // First try to get class ID from nested class object (most common structure)
            if (cls.class) {
              // cls.class might be an ObjectId or a populated object
              if (typeof cls.class === 'object' && cls.class._id) {
                return cls.class._id.toString();
              } else if (typeof cls.class === 'object' && cls.class.id) {
                return cls.class.id.toString();
              } else if (typeof cls.class === 'string' || cls.class.toString) {
                return cls.class.toString();
              }
            }
            // Fallback to direct properties
            if (cls._id) return cls._id.toString();
            if (cls.id) return cls.id.toString();
          }
          // If it's already a string/ObjectId, convert to string
          return cls ? cls.toString() : null;
        }).filter(Boolean);
        
        console.log('📚 Using enrolled class IDs:', classIds);
        console.log('📚 Enrolled classes structure:', enrolledClasses.map(cls => ({
          hasClass: !!cls.class,
          classId: cls.class?._id || cls.class?.id || cls.class,
          directId: cls._id || cls.id,
          classType: typeof cls.class
        })));
        
        if (classIds.length === 0) {
          console.warn('⚠️ No valid class IDs extracted from enrolled classes');
        } else {
          classIds.forEach(id => {
            if (id) queryParams.append('class', id.toString());
          });
        }
      }
      
      // Priority 3: If no classes but subject provided, try with subject only
      // This allows fetching content even if student hasn't joined classes yet
      // But prioritize class IDs - if we have enrolled classes, don't use subject filter
      if (enrolledClasses.length === 0 && !classId && subject) {
        console.log('⚠️ No enrolled classes, using subject filter:', subject);
        queryParams.append('subject', subject);
      }
      
      if (type) queryParams.append('type', type);
      
      // Only get published content for students (unless explicitly requested)
      if (status) {
        queryParams.append('status', status);
      } else {
        queryParams.append('status', 'published');
      }

      // If we have no class IDs and no subject, return empty
      if (enrolledClasses.length === 0 && !classId && !subject) {
        console.log('⚠️ No enrolled classes found and no classId/subject provided');
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
          message: 'No enrolled classes found. Please join a class first.'
        });
      }

      // Fetch content from teacher backend
      const contentUrl = `${teacherApiUrl}/api/content/student?${queryParams.toString()}`;
      console.log('📡 Fetching content from:', contentUrl);
      console.log('📡 Query params:', {
        classIds: Array.from(queryParams.getAll('class')),
        subject: queryParams.get('subject'),
        type: queryParams.get('type'),
        status: queryParams.get('status')
      });
      
      const contentResponse = await fetch(contentUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!contentResponse.ok) {
        const errorData = await contentResponse.json().catch(() => ({}));
        console.error('❌ Error fetching content from teacher backend:', {
          status: contentResponse.status,
          statusText: contentResponse.statusText,
          error: errorData
        });
        return res.status(contentResponse.status).json({
          success: false,
          message: 'Failed to fetch content from teacher backend',
          error: errorData.message || 'Unknown error'
        });
      }

      const contentData = await contentResponse.json();
      let content = contentData.data || (contentData.success ? (contentData.data || []) : []);

      // Filter content to only include classes the student is enrolled in (if we have enrolled classes)
      if (enrolledClasses.length > 0) {
        const classIds = enrolledClasses.map(cls => {
          // Extract class ID from enrolled class structure
          if (cls.class) {
            return (cls.class._id || cls.class.id || cls.class).toString();
          }
          return (cls._id || cls.id || cls).toString();
        });
        
        console.log('🔍 Filtering content by class IDs:', classIds);
        
        content = content.filter(item => {
          const itemClassId = item.class?._id || item.class?.id || item.class;
          if (!itemClassId) {
            // If content has no class, include it (might be general content)
            return true;
          }
          const matches = classIds.some(id => id === itemClassId.toString());
          if (!matches) {
            console.log('❌ Filtered out content:', {
              title: item.title,
              itemClassId: itemClassId.toString(),
              enrolledClassIds: classIds
            });
          }
          return matches;
        });
        
        console.log('✅ After filtering:', {
          total: content.length,
          chapters: content.filter(c => c.type === 'chapter').length,
          subtopics: content.filter(c => c.type === 'subtopic').length
        });
      }

      const chapters = content.filter(c => c.type === 'chapter');
      const subtopics = content.filter(c => c.type === 'subtopic');
      
      console.log('✅ Content fetched successfully:', {
        total: content.length,
        chapters: chapters.length,
        subtopics: subtopics.length,
        other: content.filter(c => c.type !== 'chapter' && c.type !== 'subtopic').length
      });
      
      // Log detailed chapter information
      if (chapters.length > 0) {
        console.log('📚 Chapters received:', chapters.map(ch => ({
          _id: ch._id?.toString() || ch._id,
          chapterId: ch.chapter?.id,
          name: ch.chapter?.name || ch.title,
          hasChapterId: !!ch.chapter?.id,
          classId: ch.class?._id?.toString() || ch.class?.id || ch.class
        })));
      }
      
      // Log detailed subtopic information
      if (subtopics.length > 0) {
        console.log('📝 Subtopics received:', subtopics.map(st => ({
          _id: st._id?.toString() || st._id,
          subtopicId: st.subtopic?.id,
          chapterId: st.chapter?.id,
          title: st.subtopic?.title || st.title,
          hasChapterId: !!st.chapter?.id,
          chapterName: st.chapter?.name,
          classId: st.class?._id?.toString() || st.class?.id || st.class
        })));
      }

      res.status(200).json({
        success: true,
        count: content.length,
        data: content
      });
    } catch (teacherError) {
      console.error('❌ Error communicating with teacher backend:', teacherError);
      return res.status(500).json({
        success: false,
        message: 'Error fetching content from teacher backend',
        error: teacherError.message
      });
    }
  } catch (error) {
    console.error('❌ Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting content',
      error: error.message
    });
  }
};

// @desc    Get single content item
// @route   GET /api/content/:id
// @access  Private
exports.getContentItem = async (req, res, next) => {
  try {
    const contentId = req.params.id;
    const teacherApiUrl = process.env.TEACHER_API_URL || 'http://localhost:5001';

    // Fetch content from teacher backend
    const contentResponse = await fetch(
      `${teacherApiUrl}/api/content/${contentId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.authorization || ''
        }
      }
    );

    if (!contentResponse.ok) {
      const errorData = await contentResponse.json().catch(() => ({}));
      return res.status(contentResponse.status).json({
        success: false,
        message: 'Content not found',
        error: errorData.message || 'Unknown error'
      });
    }

    const contentData = await contentResponse.json();
    const content = contentData.data || contentData.success ? (contentData.data || null) : null;

    // Verify student is enrolled in the class
    const studentId = req.user._id;
    const classesResponse = await fetch(
      `${teacherApiUrl}/api/classes/student/${studentId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (classesResponse.ok) {
      const classesData = await classesResponse.json();
      const enrolledClasses = classesData.data || [];
      const classIds = enrolledClasses.map(cls => cls._id || cls.id);
      const contentClassId = content?.class?._id || content?.class?.id || content?.class;

      if (!classIds.some(id => id.toString() === contentClassId?.toString())) {
        return res.status(403).json({
          success: false,
          message: 'You are not enrolled in this class'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('❌ Get content item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting content item',
      error: error.message
    });
  }
};

