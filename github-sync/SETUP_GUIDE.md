# FinDom Elite Tracker - GitHub Sync Setup Guide

## Overview
This guide will help you set up the GitHub sync functionality for your FinDom Elite Tracker Chrome extension.

## Prerequisites
- GitHub account
- Chrome browser
- Your FinDom Elite Tracker extension installed

## Step 1: Upload Files to GitHub Repository

1. **Navigate to your repository**: https://github.com/haoklaus11/fnd-extension-sync

2. **Upload the following files/folders**:
   ```
   📁 data/
   ├── config.json
   ├── tasks.json
   ├── users.json
   └── tribute-history.json
   
   📁 .github/
   └── workflows/
       └── sync.yml
   
   📁 scripts/
   └── validate-data.js
   
   📄 package.json
   📄 server.js
   📄 README.md
   ```

3. **Upload via GitHub web interface**:
   - Click "Upload files" or "Add file" → "Upload files"
   - Drag and drop the files or click "choose your files"
   - Commit the changes

## Step 2: Generate GitHub Personal Access Token

1. **Go to GitHub Settings**:
   - Click your profile picture → Settings
   - Navigate to "Developer settings" → "Personal access tokens" → "Tokens (classic)"

2. **Generate new token**:
   - Click "Generate new token (classic)"
   - Name: `FinDom Extension Sync`
   - Expiration: Choose your preference (90 days recommended)
   - Select scopes:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `read:org` (Read org and team membership)

3. **Copy the token** - You won't see it again!

## Step 3: Configure Extension

1. **Open the extension**:
   - Click the extension icon
   - Enter activation code: `GODDESS-KU00WKU`

2. **Access Admin Panel**:
   - Click "Admin Throne" button
   - Navigate to a settings/configuration tab

3. **Configure GitHub Token**:
   - Paste your GitHub token
   - Click "Save Token"
   - Test the connection

## Step 4: Enable GitHub Pages (Optional)

1. **In your repository settings**:
   - Go to Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: `main`
   - Folder: `/ (root)`

2. **Your sync API will be available at**:
   `https://haoklaus11.github.io/fnd-extension-sync/`

## Step 5: Test the Integration

1. **Test Connection**:
   - In the admin panel, click "Test Connection"
   - Should show "Connection successful!"

2. **Sync Data**:
   - Click "Sync Now" to pull data from GitHub
   - Click "Push to GitHub" to upload local changes

3. **Verify on GitHub**:
   - Check that your repository files are updated
   - Look for commit messages from the extension

## Troubleshooting

### Common Issues:

1. **"Invalid GitHub token"**:
   - Ensure the token has correct permissions
   - Check if the token has expired
   - Regenerate if necessary

2. **"Connection failed"**:
   - Verify repository name is correct
   - Check internet connection
   - Ensure repository is not private (or token has repo access)

3. **"Sync failed"**:
   - Check GitHub API rate limits
   - Verify JSON files are valid
   - Look at browser console for errors

### Debug Steps:

1. **Check browser console**:
   - Right-click extension → Inspect
   - Look for error messages

2. **Verify repository structure**:
   - Ensure all data files are present
   - Check file permissions

3. **Test with curl**:
   ```bash
   curl -H "Authorization: token YOUR_TOKEN" \
        https://api.github.com/repos/haoklaus11/fnd-extension-sync/contents/data/tasks.json
   ```

## Advanced Configuration

### Custom Sync Intervals:
- Edit `data/config.json` to change sync frequency
- Modify `syncInterval` value (in milliseconds)

### Webhook Integration:
- Set up webhooks in repository settings
- Point to your server endpoint for real-time updates

### Local Development:
```bash
# Install dependencies
npm install

# Run local server
npm start

# Validate data files
npm run validate
```

## Security Considerations

1. **Token Security**:
   - Never commit tokens to repository
   - Use environment variables for server deployment
   - Rotate tokens regularly

2. **Data Privacy**:
   - Consider using private repository
   - Review who has access to your data
   - Implement additional encryption if needed

3. **Rate Limiting**:
   - GitHub API has rate limits
   - Extension implements retry logic
   - Monitor usage in repository insights

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review GitHub API documentation
3. Check extension console for errors
4. Verify repository permissions

## File Structure Reference

```
fnd-extension-sync/
├── data/
│   ├── config.json       # Extension configuration
│   ├── tasks.json        # Task definitions
│   ├── users.json        # User profiles
│   └── tribute-history.json # Transaction history
├── .github/
│   └── workflows/
│       └── sync.yml      # GitHub Actions workflow
├── scripts/
│   └── validate-data.js  # Data validation script
├── package.json          # Node.js dependencies
├── server.js            # Local development server
└── README.md            # Documentation
```

---

Your FinDom Elite Tracker extension is now configured for GitHub sync! 🚀
