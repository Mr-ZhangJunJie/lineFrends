import Vue from 'vue'
import Router from 'vue-router'
import P1 from '@/components/p1'
import P2 from '@/components/p2'
import P3 from '@/components/p3'
import ErrPage from '@/components/404'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: {name: 'index'}
    },
    {
      path: '/index',
      name: 'index',
      component: P1
    },
    {
      path: '/p2',
      name: 'p2',
      component: P2
    },
    {
      path: '/p3',
      name: 'p3',
      component: P3
    },
      // meta: {
      //   keepAlive: false, //该字段表示该页面需要缓存
      //   isBack: true //判断是否是返回
      // }
    // },
    // {
    //   path: '/m2c1/:id',
    //   name: 'm2c1',
    //   component: P6
    // },
    {
      path: '/404',
      name: '404',
      component: ErrPage
    },
    {
      path: '*',
      redirect: {name: '404'}
    }
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (about.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
    // },
  ]
})
