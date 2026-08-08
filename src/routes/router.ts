//import tools
import express from 'express';

//import modules
import ctrl from '../controllers/mainController';
import registerValidation from '../middlewares/registerValidator';
import validator from '../middlewares/validator';

const router = express.Router();

//Render REST api
router.get('/', ctrl.game_home_get);
//API REST api
router.post('/api/login', registerValidation, validator(), ctrl.game_login_post);

export default router;