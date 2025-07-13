# FinDom Elite Tracker

A comprehensive Chrome extension for managing FinDom tasks with GitHub synchronization capabilities.

## 📁 Project Structure

```
findom-extension-sync/
├── extension/              # Chrome Extension files
│   ├── manifest.json       # Extension manifest
│   ├── popup.html          # Main popup interface
│   ├── popup.js            # Popup functionality
│   ├── popup-activation.html # Activation page
│   ├── popup-activation.js  # Activation logic
│   ├── background-task-sync.js # Background script
│   └── styles.css          # Extension styles
├── server/                 # Express server
│   ├── server.js           # Main server file
│   └── routes/
│       └── tasks.js        # Task API routes
├── github/                 # GitHub data files
│   ├── tasks.json          # Task data
│   └── config.json         # Configuration
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## 🚀 Features

### Chrome Extension
- **Activation System**: Secure code-based activation
- **Task Dashboard**: View and manage assigned tasks
- **Real-time Sync**: Synchronize with GitHub repository
- **Admin Panel**: Full task management interface
- **Dark Theme**: Professional dark UI with gold accents

### Server API
- **RESTful API**: Full CRUD operations for tasks
- **GitHub Integration**: Webhook support for real-time updates
- **Validation**: Code and token validation endpoints
- **Health Monitoring**: Health check and API documentation

### GitHub Sync
- **Real-time Updates**: Automatic synchronization
- **Data Persistence**: JSON-based data storage
- **Version Control**: Full Git history of changes
- **Webhook Support**: Real-time notifications

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/haoklaus11/fnd-extension-sync.git
cd fnd-extension-sync
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3000
GITHUB_TOKEN=your_github_token_here
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
NODE_ENV=development
```

### 4. Start the Server
```bash
npm start
```

### 5. Load Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/` folder

## 🔧 Configuration

### GitHub Setup
1. Create a GitHub Personal Access Token
2. Update the token in the admin panel
3. Configure webhook (optional)

### Activation Codes
Default activation codes:
- `FINDOM2024`
- `ELITE-SLAVE-001`
- `SUBMIT-NOW`
- `GODDESS-APPROVED`
- `TRIBUTE-READY`

## 📚 API Documentation

### Task Endpoints
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/status` - Update task status

### Validation Endpoints
- `POST /api/validate/code` - Validate activation code
- `POST /api/validate/token` - Validate GitHub token

### Other Endpoints
- `GET /health` - Health check
- `POST /webhook/github` - GitHub webhook
- `GET /api/docs` - API documentation

## 🔒 Security Features

- **Token Encryption**: Secure storage of GitHub tokens
- **Code Validation**: Secure activation system
- **Webhook Signatures**: Validated GitHub webhooks
- **CORS Protection**: Configured cross-origin policies

## 🎨 UI Components

### Extension Popup
- **Task List**: Interactive task cards
- **Sync Controls**: Manual sync button
- **Status Indicators**: Real-time status updates
- **Notifications**: Success/error messages

### Admin Panel
- **Task Management**: Full CRUD interface
- **User Analytics**: User statistics
- **GitHub Config**: Token and sync settings
- **Tribute History**: Payment tracking

## 📱 Usage

### For Users
1. Install the extension
2. Activate with provided code
3. View assigned tasks
4. Complete tasks and sync progress

### For Administrators
1. Access admin panel from popup
2. Create and manage tasks
3. Configure GitHub integration
4. Monitor user activity

## 🔄 Sync Process

1. **Manual Sync**: Click sync button in popup
2. **Auto Sync**: Background sync every 5 minutes
3. **Webhook Sync**: Real-time updates via GitHub webhooks
4. **Conflict Resolution**: Server-wins strategy

## 🧪 Testing

Run the validation script:
```bash
npm run validate
```

Run the test suite:
```bash
npm test
```

## 📊 Data Structure

### Task Object
```json
{
  "id": 1,
  "title": "Task Title",
  "description": "Task description",
  "tribute": "$50",
  "xp": 100,
  "difficulty": "easy",
  "status": "PENDING",
  "deadline": "2024-01-21T09:00:00Z",
  "createdAt": "2024-01-20T06:00:00Z",
  "updatedAt": "2024-01-20T06:00:00Z"
}
```

## 🔧 Development

### Adding New Features
1. Update extension files in `extension/`
2. Add API endpoints in `server/routes/`
3. Update GitHub data structure in `github/`
4. Test thoroughly

### Debugging
- Check browser console for extension errors
- Monitor server logs for API issues
- Use GitHub API logs for sync problems

## 📦 Deployment

### Server Deployment
```bash
# Build and start
npm run build
npm start
```

### Extension Distribution
1. Create extension package
2. Submit to Chrome Web Store
3. Configure production GitHub repository

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the API documentation at `/api/docs`
- Review the server logs for errors

## 🔮 Future Enhancements

- [ ] Mobile app companion
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Custom themes
- [ ] Push notifications
- [ ] Backup and restore
- [ ] User permissions system

---

**Note**: This is a specialized application for adult entertainment purposes. Please use responsibly and in accordance with all applicable laws and regulations.
