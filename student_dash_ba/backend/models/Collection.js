const mongoose = require('mongoose');

const collectionItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['ai-notes', 'user-notes', 'ai-videos', 'important-doubts', 'document', 'image'],
    required: true
  },
  content: {
    text: String,
    url: String,
    filename: String,
    size: Number,
    duration: String, // for videos
    pages: Number, // for documents
    thumbnail: String
  },
  metadata: {
    subject: String,
    topic: String,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard']
    },
    tags: [String],
    description: String
  },
  source: {
    type: String,
    enum: ['uploaded', 'generated', 'bookmarked', 'shared'],
    default: 'uploaded'
  },
  originalId: mongoose.Schema.Types.ObjectId, // Reference to original doubt, quiz, etc.
  isFavorite: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const customFolderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  color: {
    type: String,
    default: '#6366f1'
  },
  icon: {
    type: String,
    default: '📁'
  },
  items: [collectionItemSchema],
  isShared: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permissions: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view'
    }
  }]
}, {
  timestamps: true
});

const lessonCollectionSchema = new mongoose.Schema({
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  lessonName: String,
  progress: {
    type: Number,
    default: 0
  },
  content: {
    'ai-notes': [collectionItemSchema],
    'user-notes': [collectionItemSchema],
    'ai-videos': [collectionItemSchema],
    'important-doubts': [collectionItemSchema],
    'custom-folders': [customFolderSchema]
  },
  totalItems: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const subjectCollectionSchema = new mongoose.Schema({
  subjectId: String,
  subjectName: String,
  icon: String,
  color: String,
  lessons: [lessonCollectionSchema],
  totalItems: {
    type: Number,
    default: 0
  }
});

const userCollectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  subjects: [subjectCollectionSchema],
  recentItems: [{
    item: collectionItemSchema,
    accessedAt: {
      type: Date,
      default: Date.now
    }
  }],
  favorites: [collectionItemSchema],
  sharedCollections: [{
    collection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserCollection'
    },
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permissions: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  settings: {
    autoOrganize: {
      type: Boolean,
      default: true
    },
    defaultPrivacy: {
      type: String,
      enum: ['private', 'public'],
      default: 'private'
    },
    notifications: {
      newShares: {
        type: Boolean,
        default: true
      },
      weeklyDigest: {
        type: Boolean,
        default: true
      }
    }
  },
  stats: {
    totalItems: {
      type: Number,
      default: 0
    },
    totalFolders: {
      type: Number,
      default: 0
    },
    totalShares: {
      type: Number,
      default: 0
    },
    storageUsed: {
      type: Number,
      default: 0 // in MB
    }
  }
}, {
  timestamps: true
});

// Indexes
userCollectionSchema.index({ user: 1 });
userCollectionSchema.index({ 'subjects.subjectId': 1 });
userCollectionSchema.index({ 'recentItems.accessedAt': -1 });

// Methods to manage collection
userCollectionSchema.methods.addItem = function(subjectId, lessonId, item) {
  let subject = this.subjects.find(s => s.subjectId === subjectId);
  
  if (!subject) {
    subject = {
      subjectId,
      subjectName: item.metadata.subject,
      icon: this.getSubjectIcon(subjectId),
      color: this.getSubjectColor(subjectId),
      lessons: [],
      totalItems: 0
    };
    this.subjects.push(subject);
  }
  
  let lesson = subject.lessons.find(l => l.lessonId.toString() === lessonId);
  
  if (!lesson) {
    lesson = {
      lessonId,
      lessonName: item.metadata.topic,
      progress: 0,
      content: {
        'ai-notes': [],
        'user-notes': [],
        'ai-videos': [],
        'important-doubts': [],
        'custom-folders': []
      },
      totalItems: 0
    };
    subject.lessons.push(lesson);
  }
  
  // Add item to appropriate category
  lesson.content[item.type].push(item);
  lesson.totalItems += 1;
  lesson.lastUpdated = new Date();
  
  subject.totalItems += 1;
  this.stats.totalItems += 1;
  
  // Add to recent items
  this.recentItems.unshift({
    item,
    accessedAt: new Date()
  });
  
  // Keep only last 20 recent items
  if (this.recentItems.length > 20) {
    this.recentItems = this.recentItems.slice(0, 20);
  }
  
  return this.save();
};

userCollectionSchema.methods.addToFavorites = function(item) {
  const existingFavorite = this.favorites.find(fav => 
    fav._id.toString() === item._id.toString()
  );
  
  if (!existingFavorite) {
    this.favorites.push(item);
    return this.save();
  }
  
  return Promise.resolve(this);
};

userCollectionSchema.methods.removeFromFavorites = function(itemId) {
  this.favorites = this.favorites.filter(fav => 
    fav._id.toString() !== itemId.toString()
  );
  return this.save();
};

userCollectionSchema.methods.createCustomFolder = function(subjectId, lessonId, folderData) {
  const subject = this.subjects.find(s => s.subjectId === subjectId);
  if (!subject) return null;
  
  const lesson = subject.lessons.find(l => l.lessonId.toString() === lessonId);
  if (!lesson) return null;
  
  const newFolder = {
    name: folderData.name,
    description: folderData.description,
    color: folderData.color || '#6366f1',
    icon: folderData.icon || '📁',
    items: [],
    isShared: false,
    sharedWith: []
  };
  
  lesson.content['custom-folders'].push(newFolder);
  this.stats.totalFolders += 1;
  
  return this.save();
};

// Helper methods
userCollectionSchema.methods.getSubjectIcon = function(subjectId) {
  const icons = {
    'mathematics': '📐',
    'physics': '⚛️',
    'chemistry': '🧪',
    'biology': '🧬',
    'english': '📚',
    'history': '🏛️',
    'computer-science': '💻'
  };
  return icons[subjectId] || '📖';
};

userCollectionSchema.methods.getSubjectColor = function(subjectId) {
  const colors = {
    'mathematics': 'bg-blue-50 border-blue-200',
    'physics': 'bg-purple-50 border-purple-200',
    'chemistry': 'bg-green-50 border-green-200',
    'biology': 'bg-red-50 border-red-200',
    'english': 'bg-yellow-50 border-yellow-200',
    'history': 'bg-orange-50 border-orange-200',
    'computer-science': 'bg-gray-50 border-gray-200'
  };
  return colors[subjectId] || 'bg-gray-50 border-gray-200';
};

module.exports = mongoose.model('UserCollection', userCollectionSchema);