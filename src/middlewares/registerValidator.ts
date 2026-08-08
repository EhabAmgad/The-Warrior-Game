import {check} from 'express-validator';

const registerValidation = [
    check('email')
        .isEmail()
        .withMessage('يجب إدخال البريد الاليكتروني بشكل صحيح ..!!'),
    check('password')
        .isLength({min: 6})
        .withMessage('يجب الا تقل عدد حروف كلمة السر عن 6 أحرف ..!!')
];

export default registerValidation;