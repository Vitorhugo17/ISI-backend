const request = require('supertest')
const app = require('../server')

let cookie = "";
let cookieempresa = "";

/*
describe('Post Endpoints', () => {
  it('should register a user', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        email: "novaconta@gmail.com",
        nome: 'Nova',
        apelido: 'Conta',
        numero_mecanografico: 'A00000',
        nif: '500844321',
        password: 'TesteConta0'
      })
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')

  })
})
*/

/*
describe('Post Endpoints', () => {
  it('should login in user and enterprise', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: "diogofilipe.qr@gmail.com",
        password: 'DiogoRTest1'
      })
      cookie = res.headers["set-cookie"][0];
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('user_id')

    const res1 = await request(app)
      .post('/login')
      .send({
        email: "barquense@barquense.com",
        password: '12345'
      })
      cookieempresa = res1.headers["set-cookie"][0];
    expect(res1.statusCode).toEqual(200)
    expect(res1.body).toHaveProperty('user_id')
  })
})

describe('Get Endpoints', () => {
  it('should show user and enterprise are authenticated', async () => {
    const res = await request(app)
      .get('/authenticated')
      .set("Cookie", [cookie])
    expect(res.statusCode).toEqual(200);
    expect(res.body.isAuthenticated).toBe(true);

    const res1 = await request(app)
      .get('/authenticated')
      .set("Cookie", [cookieempresa])
    expect(res1.statusCode).toEqual(200);
    expect(res1.body.isAuthenticated).toBe(true);
    
  })
})



describe('Get Endpoints', () => {
  it('should show unused tickets', async () => {
    const res = await request(app)
      .get('/tickets/unused')
      .set("Cookie", [cookie])
    expect(res.statusCode).toEqual(200);
    
  })
})

describe('Get Endpoints', () => {
  it('should create/read/use QR Code', async () => {
    const res = await request(app)
    .post('/qrcodes')
    .send({
      product_type: 'bilhetes_disponiveis_barquense',
      company: "Barquense" })
      expect(res.statusCode).toEqual(200);

      const res1 = await request(app)
      .get(`/qrcodes/${res.body.qrcode_id}`)
    expect(res1.statusCode).toEqual(200);

    const res2 = await request(app)
    .post('/qrcodes/use')
    .send({
      qrcode_id: '6xmk4N1znnxjjPG49JlqYur2tzZY1BfzIeMqDvPHm7THRQknmy2ET9RkVtdTr8fT132N0wdif0qaBOyx2JYa73ZYhmXz4m11Sysk',
       })
       .set("Cookie", [cookieempresa])
      expect(res2.statusCode).toEqual(200);
     
  })
})

describe('Post Endpoints', () => {
  it('should send share a ticket', async () => {
    const res = await request(app)
      .post('/tickets/share')
      .send({
        shared_with_id: "151",
        company: 'Barquense',
        type: 'bilhetes_disponiveis_barquense'
      })
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
  })
})

describe('Get Endpoints', () => {
  it('should show used tickets', async () => {
    const res = await request(app)
      .get('/tickets/used')
    expect(res.statusCode).toEqual(200);
    
  })
})

describe('Get Endpoints', () => {
  it('should show the products', async () => {
    const res = await request(app)
      .get('/products')
    expect(res.statusCode).toEqual(200);
    
  })
})

describe('Get Endpoints', () => {
  it('should show the purchases', async () => {
    const res = await request(app)
      .get('/purchases')
    expect(res.statusCode).toEqual(200);
    
  })
})

describe('Get Endpoints', () => {
  it('should show the recommendation', async () => {
    const res = await request(app)
      .get('/recommendation')
    expect(res.statusCode).toEqual(200);
    
  })
})

describe('Get Endpoints', () => {
  it('should show the profile', async () => {
    const res = await request(app)
      .get('/profile')
    expect(res.statusCode).toEqual(200);
    
  })
})

describe('Post Endpoints', () => {
  it('should edit profile', async () => {
    const res = await request(app)
      .put('/profile/edit')
      .send({
        name: "Filipe",
        lastname: 'Quintas',
        birth_date: '23/12/1999',
        contact: '918470958'
      })
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
  })
})



describe('Get Endpoints', () => {
  it('should show the clients', async () => {
    const res = await request(app)
      .get('/users')
    expect(res.statusCode).toEqual(200);
    
  })
})

describe('Post Endpoints', () => {
  it('should send email to recover the password', async () => {
    const res = await request(app)
      .post('/password/recover')
      .send({
        email: "diogofilipe.qr@gmail.com",
      })
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
  })
})

describe('Post Endpoints', () => {
  it('should fail at sending email to recover the password', async () => {
    const res = await request(app)
      .post('/password/recover')
      .send({
        email: "diogofilipe@gmail.com",
      })
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message')
  })
})

describe('Get Endpoints', () => {
    it('should download PDF (Trandev)', async () => {
      const res = await request(app)
        .get('/download/Transdev/FR.2020.21')
      expect(res.statusCode).toEqual(200);
      
    })
  })

  describe('Get Endpoints', () => {
    it('should download PDF (Barquense)', async () => {
      const res = await request(app)
        .get('/download/Barquense/319563639')
      expect(res.statusCode).toEqual(200);
      
    })
  })

  
describe('Post Endpoints', () => {
  it('should update the password', async () => {
    const res = await request(app)
      .put('/password/update')
      .send({
        type: 'update',
        password: "DiogoRTest1",
      })
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
  })
})


describe('Post Endpoints', () => {
  it('should create a payment request, show payment status and show stripe key', async () => {
    const res = await request(app)
      .post('/payment')
      .send({
        quantity: '2',
        product_id: '49245902',
        company: 'Barquense'
       
      })
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('paymentIntent')

    const res1 = await request(app)
    .get(`/payment/${res.body.paymentIntent.id}/status`)

  expect(res1.statusCode).toEqual(200);

  const res2 = await request(app)
    .get('/stripe-key')

  expect(res2.statusCode).toEqual(200);
    
  })
})


describe('Get Endpoints', () => {
  it('should logout from user and enterprise', async () => {
    const res = await request(app)
      .get('/logout')
      .set("Cookie", [cookie])
    expect(res.statusCode).toEqual(200);

    const res1 = await request(app)
      .get('/logout')
      .set("Cookie", [cookieempresa])
    expect(res1.statusCode).toEqual(200);
    
  })
})

describe('Get Endpoints', () => {
  it('should show user and enterprise not authenticated', async () => {
    const res = await request(app)
      .get('/authenticated')
      .set("Cookie", [cookie])
    expect(res.statusCode).toEqual(200);
    expect(res.body.isAuthenticated).toBe(false);

    const res1 = await request(app)
      .get('/authenticated')
      .set("Cookie", [cookieempresa])
    expect(res1.statusCode).toEqual(200);
    expect(res1.body.isAuthenticated).toBe(false);
    
  })
})

*/
