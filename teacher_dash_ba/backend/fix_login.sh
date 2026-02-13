#!/bin/bash

echo "Fixing teacher login issue..."

# Delete existing users
node -e "
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teacher_dashboard')
  .then(() => {
    console.log('Connected to MongoDB');
    
    const User = require('./models/User');
    
    User.deleteMany({})
      .then(() => {
        console.log('Deleted existing users');
        
        // Create new users with proper password hashing
        const bcrypt = require('bcryptjs');
        
        const teachers = [
          {
            name: 'Dr. Sarah Johnson',
            email: 'sarah.johnson@school.edu',
            password: require('bcryptjs').hashSync('password123', 10),
            role: 'teacher',
            profile: {
              firstName: 'Sarah',
              lastName: 'Johnson',
              phone: '555-0101',
              subject: 'Mathematics',
              bio: 'Passionate mathematics educator with 10 years of experience'
            },
            isActive: true
          },
          {
            name: 'Prof. Michael Chen',
            email: 'michael.chen@school.edu',
            password: require('bcryptjs').hashSync('password123', 10),
            role: 'teacher',
            profile: {
              firstName: 'Michael',
              lastName: 'Chen',
              phone: '555-0102',
              subject: 'Physics',
              bio: 'Physics professor specializing in quantum mechanics'
            },
            isActive: true
          }
        ];
        
        User.create(teachers)
          .then(() => {
            console.log('Created new users with hashed passwords');
            console.log('\nTest Credentials:');
            console.log('Email: sarah.johnson@school.edu');
            console.log('Password: password123');
            console.log('');
            console.log('Email: michael.chen@school.edu');
            console.log('Password: password123');
            process.exit(0);
          })
          .catch(err => {
            console.error('Error creating users:', err);
            process.exit(1);
          });
      })
      .catch(err => {
        console.error('Error deleting users:', err);
        process.exit(1);
      });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
"

echo "Done! You can now login with:"
echo "  Email: sarah.johnson@school.edu"
echo "  Password: password123"

