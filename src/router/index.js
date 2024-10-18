import { createRouter, createWebHistory } from 'vue-router';

import frontend from '../views/後台/page.vue';
import Question from '../views/後台/Question.vue';
import Fillin from '../views/前台/Fillin.vue';
import Statistics from '../views/前台/Statistics.vue';
import Feedback from '../views/後台/Feedback.vue';
import Edit from '../views/後台/Edit.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/page',
      name: 'page',
      component: frontend
    },
    {
      path: '/Question',
      name: 'Question',
      component: Question,
    },
    {
      path: '/Fillin/:quizId',
      name: 'Fillin',
      component: Fillin,
    },
    {
      path: '/Statistics/:id',
      name: 'Statistics',
      component: Statistics,
    },
    {
      path: '/Feedback/:surveyId',
      name: 'Feedback',
      component: Feedback,
    },
    {
      path: '/Edit/:id',
      name: 'Edit',
      component: Edit,
    },
    {
      path: '/',
      redirect: '/Question'
    }
  ]
});

export default router;
