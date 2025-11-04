import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />

        {/* Web Fonts */}
        <link
          href="https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700,800%7CShadows+Into+Light&display=swap"
          rel="stylesheet"
        />

        {/* Vendor CSS */}
        <link rel="stylesheet" href="/vendor/bootstrap/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/vendor/fontawesome-free/css/all.min.css" />
        <link rel="stylesheet" href="/vendor/animate/animate.compat.css" />

        {/* Theme CSS */}
        <link rel="stylesheet" href="/css/theme.css" />
        <link rel="stylesheet" href="/css/theme-elements.css" />
        <link rel="stylesheet" href="/css/theme-blog.css" />
        <link rel="stylesheet" href="/css/theme-shop.css" />

        {/* Skin CSS */}
        <link id="skinCSS" rel="stylesheet" href="/css/skins/default.css" />

        {/* Custom CSS */}
        <link rel="stylesheet" href="/css/custom.css" />

        {/* Bootstrap Icons */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.0/font/bootstrap-icons.css"
        />

        {/* Quill Editor */}
        <link
          href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />

        {/* Vendor JS */}
        <script src="/vendor/jquery/jquery.min.js"></script>
        <script src="/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
        <script src="/vendor/jquery.easing/jquery.easing.min.js"></script>

        {/* Theme JS */}
        <script src="/js/theme.js"></script>
        <script src="/js/theme.init.js"></script>

        {/* Quill Editor */}
        <script src="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js"></script>

        {/* Daum & Kakao API */}
        <script src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
        <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=90610faa13d02b09f83a700d0885a872&libraries=services"></script>

        {/* Naver Maps API - Dynamic Map */}
        <script 
          type="text/javascript" 
          src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=soeyw6whad"
        ></script>
      </body>
    </Html>
  )
}



