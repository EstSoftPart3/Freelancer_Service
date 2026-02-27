// [Freelance Service] 사이드바 데이터
import {
  // Construction,
  LayoutDashboard,
  // Monitor,
  // Bug,
  // ListTodo,
  // FileX,
  // HelpCircle,
  // Lock,
  Bell,
  // Package,
  // Palette,
  // ServerOff,
  // Settings,
  // Wrench,
  UserCog,
  // UserX,
  Users,
  // MessagesSquare,
  Trophy,
  ShieldAlert,
  // ShieldCheck,
  // HelpCircle,
  // AudioWaveform,
  Command,
  // GalleryVerticalEnd,
  ListOrdered,
  ClipboardPen,
  ClipboardList,
} from 'lucide-react'
// import { ClerkLogo } from '@/assets/clerk-logo'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  // 1. 관리자 정보 (추후 auth-store와 연동 권장)
  user: {
    name: '최고관리자',
    email: 'admin@freelancer.com',
    avatar: '/avatars/admin-avatar.jpg',
  },
  teams: [
    {
      name: 'Freelancer Service',
      logo: Command,
      // plan: 'Professional Edition',
    },
  ],
  navGroups: [
    {
      title: '운영 현황',
      items: [
        {
          title: '메인 대시보드',
          url: '/',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: '매니지먼트',
      items: [
        {
          title: '유저 관리',
          icon: UserCog,
          items: [
            {
              title: '전체 유저 목록',
              url: '/users',
              icon: Users,
            },
          ],
        },
        {
          title: '게시물 관리',
          icon: ClipboardPen,
          items: [
            {
              title: '게시글 관리',
              url: '/contents/board',
              icon: ClipboardList,
            },
            {
              title: '공지사항 관리',
              url: '/contents/notice',
              icon: Bell,
            },
            {
              title: '신고 내역 관리',
              url: '/contents/reports',
              icon: ShieldAlert,
            },
          ],
        },
      ],
    },
    {
      title: '프로모션 & 이벤트',
      items: [
        {
          title: '이벤트 센터',
          icon: Trophy,
          items: [
            {
              title: '활동 랭킹 집계',
              url: '/events/ranking',
              icon: ListOrdered,
            },
          ],
        },
      ],
    },
    // {
    //   title: '시스템 설정',
    //   items: [
    //     {
    //       title: '사이트 설정',
    //       url: '/settings',
    //       icon: Settings,
    //     },
    //     {
    //       title: '고객센터 관리',
    //       url: '/help-center',
    //       icon: HelpCircle,
    //     },
    //   ],
    // },
  ],
}

// 기존 샘플
// export const sidebarData: SidebarData = {
//   user: {
//     name: 'satnaing',
//     email: 'satnaingdev@gmail.com',
//     avatar: '/avatars/shadcn.jpg',
//   },
//   teams: [
//     {
//       name: 'Shadcn Admin',
//       logo: Command,
//       plan: 'Vite + ShadcnUI',
//     },
//     {
//       name: 'Acme Inc',
//       logo: GalleryVerticalEnd,
//       plan: 'Enterprise',
//     },
//     {
//       name: 'Acme Corp.',
//       logo: AudioWaveform,
//       plan: 'Startup',
//     },
//   ],
//   navGroups: [
//     {
//       title: 'General',
//       items: [
//         {
//           title: 'Dashboard',
//           url: '/',
//           icon: LayoutDashboard,
//         },
//         {
//           title: 'Tasks',
//           url: '/tasks',
//           icon: ListTodo,
//         },
//         {
//           title: 'Apps',
//           url: '/apps',
//           icon: Package,
//         },
//         {
//           title: 'Chats',
//           url: '/chats',
//           badge: '3',
//           icon: MessagesSquare,
//         },
//         {
//           title: 'Users',
//           url: '/users',
//           icon: Users,
//         },
//         {
//           title: 'Secured by Clerk',
//           icon: ClerkLogo,
//           items: [
//             {
//               title: 'Sign In',
//               url: '/clerk/sign-in',
//             },
//             {
//               title: 'Sign Up',
//               url: '/clerk/sign-up',
//             },
//             {
//               title: 'User Management',
//               url: '/clerk/user-management',
//             },
//           ],
//         },
//       ],
//     },
//     {
//       title: 'Pages',
//       items: [
//         {
//           title: 'Auth',
//           icon: ShieldCheck,
//           items: [
//             {
//               title: 'Sign In',
//               url: '/sign-in',
//             },
//             {
//               title: 'Sign In (2 Col)',
//               url: '/sign-in-2',
//             },
//             {
//               title: 'Sign Up',
//               url: '/sign-up',
//             },
//             {
//               title: 'Forgot Password',
//               url: '/forgot-password',
//             },
//             {
//               title: 'OTP',
//               url: '/otp',
//             },
//           ],
//         },
//         {
//           title: 'Errors',
//           icon: Bug,
//           items: [
//             {
//               title: 'Unauthorized',
//               url: '/errors/unauthorized',
//               icon: Lock,
//             },
//             {
//               title: 'Forbidden',
//               url: '/errors/forbidden',
//               icon: UserX,
//             },
//             {
//               title: 'Not Found',
//               url: '/errors/not-found',
//               icon: FileX,
//             },
//             {
//               title: 'Internal Server Error',
//               url: '/errors/internal-server-error',
//               icon: ServerOff,
//             },
//             {
//               title: 'Maintenance Error',
//               url: '/errors/maintenance-error',
//               icon: Construction,
//             },
//           ],
//         },
//       ],
//     },
//     {
//       title: 'Other',
//       items: [
//         {
//           title: 'Settings',
//           icon: Settings,
//           items: [
//             {
//               title: 'Profile',
//               url: '/settings',
//               icon: UserCog,
//             },
//             {
//               title: 'Account',
//               url: '/settings/account',
//               icon: Wrench,
//             },
//             {
//               title: 'Appearance',
//               url: '/settings/appearance',
//               icon: Palette,
//             },
//             {
//               title: 'Notifications',
//               url: '/settings/notifications',
//               icon: Bell,
//             },
//             {
//               title: 'Display',
//               url: '/settings/display',
//               icon: Monitor,
//             },
//           ],
//         },
//         {
//           title: 'Help Center',
//           url: '/help-center',
//           icon: HelpCircle,
//         },
//       ],
//     },
//   ],
// }
