//importing all required packages
const express = require('express');
const shortId = require('shortid');
const createHttpError = require('http-errors');
const mongoose = require('mongoose');
const router = express.Router();
const path = require('path');
const morgan = require('morgan');
const app = express();
const ShortUrl = require('./models/url.model')

//middleware
app.use(express.static(path.join(__dirname,'public')))
app.use(morgan('dev'));
app.use(express.json())
app.use(express.urlencoded({extended: false}))

//setting up view engine
app.set('view engine','ejs')

//connecting to database
mongoose.connect('mongodb+srv://suhaas02:suhaas02@cluster0.vhhm4.mongodb.net/?retryWrites=true&w=majority', {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useCreateIndex: true
})
.then(() => console.log('Database connected'))
.catch((error) => console.log("Error connecting to database"));

app.get('/',async(req,res,next) => {
    res.render('index')
})


//handling post and get routes
router.post('/', async (req, res, next) => {
    try {
      const { url } = req.body
      if (!url) {
        throw createHttpError.BadRequest('Provide a valid url')
      }
      const urlExists = await ShortUrl.findOne({ url })
      if (urlExists) {
        res.render('index', {
          // short_url: `${req.hostname}/${urlExists.shortId}`,
          short_url: `${req.headers.host}/${urlExists.shortId}`,
        })
        return
      }
      const shortUrl = new ShortUrl({ url: url, shortId: shortId.generate() })
      const result = await shortUrl.save()
      res.render('index', {
        // short_url: `${req.hostname}/${urlExists.shortId}`,
        short_url: `${req.headers.host}/${result.shortId}`,
      })
    } catch (error) {
      next(error)
    }
  })


  router.get('/:shortId', async (req, res, next) => {
    try {
      const { shortId } = req.params
      const result = await ShortUrl.findOne({ shortId })
      if (!result) {
        throw createHttpError.NotFound('Short url does not exist')
      }
      res.redirect(result.url)
    } catch (error) {
      next(error)
    }
  })
  
  router.use((req, res, next) => {
    next(createHttpError.NotFound())
  })
  
  router.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.render('index', { error: err.message })
  })

app.listen(process.env.PORT || 3000,() => console.log("Listening on port 3000"));