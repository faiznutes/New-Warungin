import { Response } from 'express';

export const successResponse = (res: Response, data: any, message = 'Success') => {
    return res.status(200).json({
        success: true,
        message,
        data
    });
};

export const errorResponse = (res: Response, message: string, code = 500, error: any = null) => {
    return res.status(code).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? error : undefined
    });
};
