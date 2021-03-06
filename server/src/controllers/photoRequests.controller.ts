import { Request, Response } from 'express'
import path from 'path'
import fs from 'fs'

import PhotoRequest, { IPhotoRequest } from '../models/PhotoRequest'

import errorHandler from '../utils/errorHandler'
import isValidObjectId from '../utils/isValidObjectId'
import sendEmail from '../utils/sendEmail'
import getServerUrl from '../utils/getServerUrl'

import getAllService from '../services/getAll.service'
import getByIdService from '../services/getById.service'

import { HTTPStatusCodes } from '../types'

class requestController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email }: IPhotoRequest = req.body

      if(!name.trim() || !email.trim()) {
        return errorHandler(res, HTTPStatusCodes.BadRequest, 'Заполните все поля')
      }

      const images = (req.files as Express.Multer.File[]).map(file => file.filename)

      const photoRequest = new PhotoRequest({
        name,
        email,
        images
      })

      await photoRequest.save()
      return res.status(HTTPStatusCodes.Created).json(photoRequest)
    } catch (e) {
      console.log(e)
      return errorHandler(res)
    }
  }

  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      return getAllService(res, PhotoRequest)
    } catch (e) {
      console.log(e)
      return errorHandler(res)
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      return getByIdService(req, res, PhotoRequest, 'Заявка', 'а')
    } catch (e) {
      console.log(e)
      return errorHandler(res)
    }
  }

  async process(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      if(!isValidObjectId(id)) {
        return errorHandler(res, HTTPStatusCodes.BadRequest, 'Некорректный id')
      }

      const photoRequest = await PhotoRequest.findById(id)

      if(!photoRequest) {
        return errorHandler(res, HTTPStatusCodes.NotFound, 'Заявка не найдена')
      }

      photoRequest.isProcessed = !photoRequest.isProcessed
      await photoRequest.save()
      return res.json(photoRequest)
    } catch (e) {
      console.log(e)
      return errorHandler(res)
    }
  }

  async email(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      if(!isValidObjectId(id)) {
        return errorHandler(res, HTTPStatusCodes.BadRequest, 'Некорректный id')
      }

      const photoRequest = await PhotoRequest.findById(id)

      if(!photoRequest) {
        return errorHandler(res, HTTPStatusCodes.NotFound, 'Заявка не найдена')
      }

      const { comment, price } = req.body

      if(!Number(price)) {
        return errorHandler(res, HTTPStatusCodes.NotFound, 'Укажите цену')
      }

      const { name, email, images } = photoRequest

      const url = getServerUrl(req)

      sendEmail({
        from: `Клининговая компания ${process.env.NODEMAILER_USER}`,
        to: email,
        subject: 'Расчет стоимости клининговых услуг по фотографиям',
        html: `
          <p>Здравствуйте, ${name}</p>
          <p>Стоимость оказания клининговых услуг составляет ${price} руб.</p>
          ${comment ? `<p>${comment}</p>` : ''}
          ${images.reduce((acc, el) => acc += `<img src="${url}/uploads/${el}" />`, '')}
        `
      }, async err => {
        if(err) {
          console.log(err)
          return errorHandler(res, HTTPStatusCodes.BadRequest, 'Не удалось отправить email')
        } else {
          return res.json({ message: 'Email успешно отправлен' })
        }
      })
    } catch (e) {
      console.log(e)
      return errorHandler(res)
    }
  }

  async remove(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      if(!isValidObjectId(id)) {
        return errorHandler(res, HTTPStatusCodes.BadRequest, 'Некорректный id')
      }

      const photoRequest = await PhotoRequest.findById(id)

      if(!photoRequest) {
        return errorHandler(res, HTTPStatusCodes.NotFound, 'Заявка не найдена')
      }

      const { images } = photoRequest

      try {
        images.forEach(image => {
          const filePath = path.resolve(__dirname, '..', '..', 'uploads') + '\\' + image
          fs.unlink(filePath, err => {
            if(err) {
              return errorHandler(res, HTTPStatusCodes.BadRequest, 'Не удалось удалить изображение')
            }
          })
        })

        await photoRequest.deleteOne()
        return res.json({ message: 'Заявка успешно удалена' })
      } catch (e) {
        return errorHandler(res, HTTPStatusCodes.BadRequest, 'Ошибка при удалении')
      }
    } catch (e) {
      console.log(e)
      return errorHandler(res)
    }
  }
}

export default new requestController()