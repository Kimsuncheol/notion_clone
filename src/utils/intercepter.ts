// // utils/interceptor.ts
// // 불필요한 요청을 차단하는 인터셉터

// export const setupRequestInterceptor = () => {
//     if (typeof window === 'undefined') return;
  
//     // 1. Fetch API 인터셉트
//     const originalFetch = window.fetch;
//     window.fetch = function(...args) {
//       const url = args[0];
//       const urlString = typeof url === 'string' ? url : url instanceof URL ? url.href : '';
      
//       if (urlString.includes('zybTrackerStatisticsAction')) {
//         console.warn('Blocked tracker request:', urlString);
//         // 가짜 성공 응답 반환
//         return Promise.resolve(new Response('{}', { 
//           status: 200,
//           headers: { 'Content-Type': 'application/json' }
//         }));
//       }
      
//       return originalFetch.apply(this, args);
//     };
  
//     // 2. XMLHttpRequest 인터셉트
//     const originalOpen = XMLHttpRequest.prototype.open;
//     XMLHttpRequest.prototype.open = function(method, url, ...args) {
//       if (typeof url === 'string' && url.includes('zybTrackerStatisticsAction')) {
//         console.warn('Blocked XHR tracker request:', url);
//         // 요청을 무시하고 빈 응답 설정
//         this.addEventListener('readystatechange', function() {
//           if (this.readyState === 4) {
//             Object.defineProperty(this, 'status', { value: 200, writable: false });
//             Object.defineProperty(this, 'responseText', { value: '{}', writable: false });
//           }
//         });
//         return;
//       }
      
//       return originalOpen.apply(this, [method, url, ...args]);
//     };
  
//     // 3. 스크립트 태그 동적 생성 차단
//     const originalCreateElement = document.createElement;
//     document.createElement = function(tagName, ...args) {
//       const element = originalCreateElement.apply(this, [tagName, ...args]);
      
//       if (tagName.toLowerCase() === 'script') {
//         const originalSetSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src')?.set;
//         if (originalSetSrc) {
//           Object.defineProperty(element, 'src', {
//             set: function(value) {
//               if (typeof value === 'string' && value.includes('zybTrackerStatistics')) {
//                 console.warn('Blocked script tracker:', value);
//                 return;
//               }
//               originalSetSrc.call(this, value);
//             },
//             get: function() {
//               return this.getAttribute('src') || '';
//             }
//           });
//         }
//       }
      
//       return element;
//     };
//   };
  
//   // _app.tsx 또는 layout.tsx에서 호출
//   // useEffect(() => {
//   //   setupRequestInterceptor();
//   // }, []);