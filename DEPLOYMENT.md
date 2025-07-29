# Deployment Guide

This project is deployed using **GitHub Pages**, which allows you to host static websites directly from your GitHub repository.

## Live Site

🌐 **Live URL:** `https://itstudyu.github.io/technical-reference/`

## Deployment Steps

### 1. Enable GitHub Pages

1. Go to your repository: `https://github.com/itstudyu/technical-reference`
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **Deploy from a branch**
5. Choose **main** branch
6. Select **/ (root)** folder
7. Click **Save**

### 2. Automatic Deployment

- Every time you push changes to the `main` branch, GitHub Pages will automatically rebuild and deploy your site
- Deployment usually takes 1-5 minutes
- You'll receive an email notification when deployment is complete

### 3. Custom Domain (Optional)

If you want to use a custom domain:

1. Add a `CNAME` file to the root directory with your domain name
2. Configure DNS settings with your domain provider
3. Update the **Custom domain** setting in GitHub Pages settings

## Deployment Status

You can check deployment status at:
`https://github.com/itstudyu/technical-reference/deployments`

## Local Development

To test locally before deploying:

```bash
# Option 1: Using Python
python -m http.server 8000

# Option 2: Using Node.js
npx http-server

# Option 3: Using Live Server (VS Code extension)
# Right-click index.html → "Open with Live Server"
```

Then open `http://localhost:8000` in your browser.

## File Structure

```
technical-reference/
├── index.html          # Main landing page
├── proxy.html          # Proxy documentation
├── reverse-proxy.html  # Reverse proxy documentation
├── styles/
│   └── main.css       # Main stylesheet
├── js/
│   └── main.js        # JavaScript functionality
└── DEPLOYMENT.md      # This file
```

## Important Notes

- GitHub Pages only serves static files (HTML, CSS, JS, images)
- The site is automatically generated from the `main` branch
- Changes may take a few minutes to appear live
- Ensure all file paths are relative for proper deployment
- The site is publicly accessible once deployed

## Troubleshooting

### Site not loading?
- Check if GitHub Pages is enabled in repository settings
- Verify the source branch is set to `main`
- Wait 5-10 minutes for initial deployment

### 404 errors?
- Ensure `index.html` exists in the root directory
- Check that all internal links use relative paths
- Verify file names match exactly (case-sensitive)

### Updates not showing?
- Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
- Check GitHub Actions tab for deployment status
- Wait a few minutes for changes to propagate

---

**Last Updated:** $(date +'%Y-%m-%d') 