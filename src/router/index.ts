import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

export enum Route {
    HOME = 'HOME',
}

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: Route.HOME,
        component: () => import('openpose/views/editor/index.vue'),
    },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});
