const path = require('path');
const { resolvePublicErrorMessage } = require('./publicError');

function renderWithLayout(res, viewName, data = {}) {
  const ejs = require('ejs');
  const viewPath = path.join(__dirname, '../views', viewName + '.ejs');

  const inferredBaseUrl = res.locals.baseUrl !== undefined ? res.locals.baseUrl : (res.app.locals.baseUrl || '');
  const resolvedBaseUrl = data.baseUrl !== undefined ? data.baseUrl : inferredBaseUrl;
  const currentUser = res.locals.user || null;
  const resolvedUsername = data.username !== undefined
    ? data.username
    : (currentUser ? currentUser.username : null);

  const viewData = {
    ...data,
    baseUrl: resolvedBaseUrl,
    username: resolvedUsername,
    user: data.user !== undefined ? data.user : currentUser
  };

  ejs.renderFile(viewPath, viewData, (err, content) => {
    if (err) {
      return res
        .status(500)
        .type('html')
        .send('<h1>View Error</h1><p>' + resolvePublicErrorMessage(err, 'Khong the render giao dien luc nay.') + '</p>');
    }

    const defaultLayout = !currentUser
      ? 'guest-layout'
      : (currentUser.role !== 'admin' && currentUser.role !== 'teacher'
        ? 'student-layout'
        : 'layout');
    const layoutName = data.layout || defaultLayout;
    const layoutPath = path.join(__dirname, '../views', layoutName + '.ejs');
    const layoutData = {
      ...viewData,
      content,
      title: viewData.title || 'MyApp',
      user: currentUser,
      baseUrl: resolvedBaseUrl,
      currentPath: res.locals.currentPath || '/',
      success_msg: res.locals.success_msg || [],
      error_msg: res.locals.error_msg || [],
      error: res.locals.error || [],
      info: res.locals.info || [],
      studentNotifications: res.locals.studentNotifications || [],
      unreadStudentNotificationCount: res.locals.unreadStudentNotificationCount || 0
    };

    ejs.renderFile(layoutPath, layoutData, (layoutErr, html) => {
      if (layoutErr) {
        return res
          .status(500)
          .type('html')
          .send('<h1>Layout Error</h1><p>' + resolvePublicErrorMessage(layoutErr, 'Khong the tai layout luc nay.') + '</p>');
      }

      res.type('html').send(html);
    });
  });
}

module.exports = renderWithLayout;
