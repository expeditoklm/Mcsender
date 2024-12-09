import { HttpInterceptorFn } from '@angular/common/http';

export const loggerInterceptor: HttpInterceptorFn = (req, next) => {
   const token = sessionStorage.getItem('user_session_token'); // Récupérer le token depuis le local storage
  console.log('Token:', token);
    console.log('req URL:', req.url);
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  return next(req);
};
