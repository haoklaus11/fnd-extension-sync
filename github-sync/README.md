# FinDom Extension Sync Backend

This repository serves as the sync backend for the FinDom Elite Tracker Chrome Extension.

## Features

- **Task Management**: Sync tasks between extension and GitHub
- **User Profiles**: Store and sync user profile data
- **Tribute Tracking**: Maintain tribute history
- **Real-time Updates**: Webhook support for live updates
- **Secure Authentication**: GitHub token-based authentication

## API Structure

### Data Files
- `data/tasks.json` - Task definitions and status
- `data/users.json` - User profiles and statistics
- `data/tribute-history.json` - Tribute transaction history
- `data/config.json` - Extension configuration

### API Endpoints
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/tribute-history` - Get tribute history

## Setup Instructions

1. **Clone this repository**
2. **Set up GitHub Pages** (for static API serving)
3. **Configure GitHub Actions** (for automation)
4. **Set up webhooks** (for real-time updates)
5. **Configure authentication tokens**

## Extension Integration

The Chrome extension connects to this repository using:
- GitHub API for data operations
- GitHub Pages for static content serving
- GitHub Actions for automated tasks
- Webhooks for real-time notifications

## Security

- All API calls require GitHub authentication
- User data is encrypted before storage
- Rate limiting implemented
- Input validation on all endpoints

## Development

To contribute to this sync backend:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details
