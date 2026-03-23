// import { fi, sq } from 'date-fns/locale'

const iconMap = {
  // Language
  java: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
  python:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
  c: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg',
  'c++':
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
  javascript:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
  typescript:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
  php: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg',
  'c#': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg',
  go: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg',

  // Framework & Library
  springboot:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg',
  django:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg',
  react:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
  vuejs:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
  nestjs:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg',
  expressjs:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg',
  nextjs:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
  nuxtjs:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nuxtjs/nuxtjs-original.svg',
  net: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dot-net/dot-net-original.svg',

  // Tools
  docker:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
  git: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
  kubernetes:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg',
  jenkins:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg',
  githubactions:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/githubactions/githubactions-original.svg',
  terraform:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/terraform/terraform-original.svg',
  ansible:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ansible/ansible-original.svg',
  jira: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jira/jira-original.svg',
  figma:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg',
  postman:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg',

  // Device (대체 아이콘 사용)
  pc: 'https://cdn.jsdelivr.net/npm/lucide-static/icons/monitor.svg',
  노트북: 'https://cdn.jsdelivr.net/npm/lucide-static/icons/laptop.svg',

  // OS
  windows:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/windows8/windows8-original.svg',
  macos:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg',
  linux:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg',

  // DBMS
  mysql:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
  oracledb:
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/oracle/oracle-original.svg',
  mongodb:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
  mariadb: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/mariadb.svg',
  redis:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg',
  postgresql:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
  sqlite:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg',

  // Cloud Services
  aws: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/amazonaws.svg',
  googlecloud:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg',
  azure:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg',
  awss3: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/amazons3.svg',
  awsec2:
    'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/amazonec2.svg',
  awslambda:
    'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/awslambda.svg',
  awsrds:
    'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/amazonrds.svg',
  cloudflare:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cloudflare/cloudflare-original.svg',
  firebase:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg',
  vercel:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg',

  // IDE
  vscode:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg',
  intellij:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/intellij/intellij-original.svg',
  vim: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vim/vim-original.svg',
  androidstudio:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/androidstudio/androidstudio-original.svg',
  eclipse:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/eclipse/eclipse-original.svg',
  visualstudio:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/visualstudio/visualstudio-original.svg',

  // 기타
  spring:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg',
  angular:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angular/angular-original.svg',
  bootstrap:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg',
  ember:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ember/ember-original.svg',

  // default icon
  default: 'https://cdn.jsdelivr.net/npm/lucide-static/icons/code.svg',
}

export default iconMap
