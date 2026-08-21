import {Router}from'express';import{getStore}from'../controllers/storeController.js';const router=Router();router.get('/:slug',getStore);export default router
