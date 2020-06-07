const request = require('supertest')
const app = require('../server')

jest.setTimeout(20000);

let cookie = "";
let cookieempresa = "";

/*
describe('Register', () => {
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
describe('Register', () => {
  it('should not register a user', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        email: "contateste1gmail.com",
        nome: 'Conta',
        apelido: 'Teste',
        numero_mecanografico: 'A99999',
        nif: '500829993',
        password: 'NovaConta1'
      })
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message')

    const res1 = await request(app)
    .post('/register')
    .send({
      email: "contateste1@gmailcom",
      nome: 'Nova',
      apelido: 'Conta',
      numero_mecanografico: 'A99999',
      nif: '500829993',
      password: 'TesteConta0'
    })
  expect(res1.statusCode).toEqual(400)
  expect(res1.body).toHaveProperty('message')

  const res2 = await request(app)
  .post('/register')
  .send({
    email: "@gmail.com",
    nome: 'Nova',
    apelido: 'Conta',
    numero_mecanografico: 'A99999',
    nif: '500829993',
    password: 'TesteConta0'
  })
expect(res2.statusCode).toEqual(400)
expect(res2.body).toHaveProperty('message')
  
  const res3 = await request(app)
  .post('/register')
  .send({
    email: "contateste1@gmail.com",
    nome: 'Nova',
    apelido: 'Conta',
    numero_mecanografico: 'A99999',
    nif: '500844321',
    password: 'TesteConta0'
  })
expect(res3.statusCode).toEqual(409)
expect(res3.body).toHaveProperty('error')

const res4 = await request(app)
.post('/register')
.send({
  email: "contateste1@gmail.com",
  nome: 'Nova',
  apelido: 'Conta',
  numero_mecanografico: 'A00000',
  nif: '500844321',
  password: 'TesteConta0'
})
expect(res4.statusCode).toEqual(409)
expect(res4.body).toHaveProperty('error')

const res5 = await request(app)
.post('/register')
.send({
  email: "contateste1@gmail.com",
  nome: 'Nova',
  apelido: 'Conta',
  numero_mecanografico: 'A99999',
  nif: '500829993',
  password: 'TesteConta'
})
expect(res5.statusCode).toEqual(400)
expect(res5.body).toHaveProperty('message')

const res6 = await request(app)
.post('/register')
.send({
  email: "contateste1@gmail.com",
  nome: 'Nova',
  apelido: 'Conta',
  numero_mecanografico: 'A99999',
  nif: '500829993',
  password: 'testeconta0'
})
expect(res6.statusCode).toEqual(400)
expect(res6.body).toHaveProperty('message')

const res7 = await request(app)
.post('/register')
.send({
  email: "contateste1@gmail.com",
  nome: 'Nova',
  apelido: 'Conta',
  numero_mecanografico: 'A99999',
  nif: '500829993',
  password: 'TESTECONTA0'
})
expect(res7.statusCode).toEqual(400)
expect(res7.body).toHaveProperty('message')

const res8 = await request(app)
.post('/register')
.send({
  email: "contateste1@gmail.com",
  nome: 'Nova',
  apelido: 'Conta',
  numero_mecanografico: 'A99999',
  nif: '500829993',
  password: 'testeconta*'
})
expect(res8.statusCode).toEqual(400)
expect(res8.body).toHaveProperty('message')

const res9 = await request(app)
.post('/register')
.send({
  email: "contateste1@gmail.com",
  nome: 'Nova',
  apelido: 'Conta',
  numero_mecanografico: 'A99999',
  nif: '500829993',
  password: 'TESTECONTA*'
})
expect(res9.statusCode).toEqual(400)
expect(res9.body).toHaveProperty('message')

const res10 = await request(app)
.post('/register')
.send({
  email: "contateste1@gmail.com",
  nome: 'Nova',
  apelido: 'Conta',
  numero_mecanografico: 'A99999',
  nif: '500829993',
  password: '10000000*'
})
expect(res10.statusCode).toEqual(400)
expect(res10.body).toHaveProperty('message')

const res11 = await request(app)
.post('/register')
.send({
  email: "contateste1@gmail.com",
  nome: 'Nova',
  apelido: 'Conta',
  numero_mecanografico: 'A99999',
  nif: '500829993',
  password: 'testeconta'
})
expect(res11.statusCode).toEqual(400)
expect(res11.body).toHaveProperty('message')

const res12 = await request(app)
.post('/register')
.send({
  email: "contateste1@gmail.com",
  nome: 'Nova',
  apelido: 'Conta',
  numero_mecanografico: 'A99999',
  nif: '500829993',
  password: 'TESTECONTA'
})
expect(res12.statusCode).toEqual(400)
expect(res12.body).toHaveProperty('message')

const res13 = await request(app)
.post('/register')
.send({
  email: "contateste1@gmail.com",
  nome: 'Nova',
  apelido: 'Conta',
  numero_mecanografico: 'A99999',
  nif: '500829993',
  password: '123456789'
})
expect(res13.statusCode).toEqual(400)
expect(res13.body).toHaveProperty('message')

const res14 = await request(app)
.post('/register')
.send({
  email: "contateste1@gmail.com",
  nome: 'Nova',
  apelido: 'Conta',
  numero_mecanografico: 'A99999',
  nif: '500829993',
  password: '*********'
})
expect(res14.statusCode).toEqual(400)
expect(res14.body).toHaveProperty('message')

const res15 = await request(app)
.post('/register')
.send({
  email: "contateste1@gmail.com",
  nome: 'Nova',
  apelido: 'Conta',
  numero_mecanografico: 'A99999',
  nif: '500829993',
  password: 'TstCnt1'
})
expect(res15.statusCode).toEqual(400)
expect(res15.body).toHaveProperty('message')
  })
})

*/
describe('Login', () => {
  it('should login in user and company', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: "diogofilipe.qr@gmail.com",
        password: 'DiogoTeste1'
      })
     if(res.statusCode == 200){ cookie = res.headers["set-cookie"][0];}
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('user_id')

    const res1 = await request(app)
      .post('/login')
      .send({
        email: "barquense@barquense.com",
        password: '12345'
      })
      if(res1.statusCode == 200){ cookieempresa = res1.headers["set-cookie"][0];}
    expect(res1.statusCode).toEqual(200)
    expect(res1.body).toHaveProperty('user_id')
  })
})

/*
describe('Login', () => {
  it('should not login', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: "diogofilipe.qr@gmail.com",
        password: 'PassErrada1'
      })
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message')

    const res2 = await request(app)
      .post('/login')
      .send({
        email: "email.errado@gmail.com",
        password: 'DiogoRTest1'
      })
    expect(res2.statusCode).toEqual(400)
    expect(res2.body).toHaveProperty('message')

  })
})


describe('Get Endpoints', () => {
  it('should show user and company are authenticated', async () => {
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
  it('should not show unused tickets', async () => {
    const res = await request(app)
      .get('/tickets/unused')
    expect(res.statusCode).toEqual(403);   
  })
})

describe('Get Endpoints', () => {
  it('should create/read/use QR Code', async () => {
    const res = await request(app)
    .post('/qrcodes')
    .send({
      product_type: 'bilhetes_disponiveis_barquense',
      company: "Barquense" })
      .set("Cookie", [cookie])
      expect(res.statusCode).toEqual(200);

      const res1 = await request(app)
      .get(`/qrcodes/${res.body.qrcode_id}`)
      .set("Cookie", [cookie])
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

describe('Get Endpoints', () => {
  it('should not create QR Code', async () => {

      const res = await request(app)
    .post('/qrcodes')
    .send({
      product_type: 'tipo_errado',
      company: "Barquense" })
      .set("Cookie", [cookie])
      expect(res.statusCode).toEqual(400);

      const res1 = await request(app)
      .post('/qrcodes')
      .send({
        product_type: 'bilhetes_disponiveis_barquense',
        company: "Barquense" })
        expect(res1.statusCode).toEqual(403);

  })
})

describe('Get Endpoints', () => {
  it('should not read QR Code', async () => {

    const res1 = await request(app)
    .post('/qrcodes')
    .send({
      product_type: 'bilhetes_disponiveis_barquense',
      company: "Barquense" })
      .set("Cookie", [cookie])
      expect(res1.statusCode).toEqual(200);

    const res = await request(app)
      .get('/qrcodes/123456789')
      .set("Cookie", [cookie])
    expect(res.statusCode).toEqual(404);
  
   
const res2 = await request(app)
      .get(`/qrcodes/${res.body.qrcode_id}`)
    expect(res2.statusCode).toEqual(403);
  })
})

describe('Get Endpoints', () => {
  it('should not use QR Code', async () => {
const res = await request(app)
    .post('/qrcodes/use')
    .send({
      qrcode_id: '123456789098765432',
       })
       .set("Cookie", [cookieempresa])
      expect(res.statusCode).toEqual(400);
     
      const res1 = await request(app)
      .post('/qrcodes/use')
      .send({
        qrcode_id: 'SEVUaPwx016SQvDT7aLcdqXdDQRUo7OA8KgvSra2WVohsQcSvy36caR9G39gBpLrcYdXAXWiHRz1gtpgxVdXldNLzRQrNkjVaXIP',
         })
        expect(res1.statusCode).toEqual(403);     
  })
})


describe('Post Endpoints', () => {
  it('should share a ticket', async () => {
    const res = await request(app)
      .post('/tickets/share')
      .send({
        shared_with_id: "151",
        company: 'Barquense',
        type: 'bilhetes_disponiveis_barquense'
      })
      .set("Cookie", [cookie])
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
  })
})


describe('Post Endpoints', () => {
  it('should not share a ticket', async () => {
    const res = await request(app)
      .post('/tickets/share')
      .send({
        shared_with_id: "00000",
        company: 'Barquense',
        type: 'bilhetes_disponiveis_barquense'
      })
      .set("Cookie", [cookie])
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message')

    const res1 = await request(app)
      .post('/tickets/share')
      .send({
        shared_with_id: "151",
        company: 'empresa_errada',
        type: 'bilhetes_disponiveis_barquense'
      })
      .set("Cookie", [cookie])
    expect(res1.statusCode).toEqual(400)
    expect(res1.body).toHaveProperty('message')

    const res2 = await request(app)
      .post('/tickets/share')
      .send({
        shared_with_id: "151",
        company: 'Barquense',
        type: 'type_errado'
      })
      .set("Cookie", [cookie])
    expect(res2.statusCode).toEqual(400)
    expect(res2.body).toHaveProperty('message')

    const res3 = await request(app)
    .post('/tickets/share')
    .send({
      shared_with_id: "151",
      company: 'Barquense',
      type: 'bilhetes_disponiveis_barquense'
    })
  expect(res3.statusCode).toEqual(403)
  expect(res3.body).toHaveProperty('message')
  })
})



describe('Get Endpoints', () => {
  it('should show used tickets', async () => {
    const res = await request(app)
      .get('/tickets/used')
      .set("Cookie", [cookie])
    expect(res.statusCode).toEqual(200);
    
  })
})

describe('Get Endpoints', () => {
  it('should not show used tickets', async () => {
    const res = await request(app)
      .get('/tickets/used')
    expect(res.statusCode).toEqual(403);
    
  })
})


describe('Get Endpoints', () => {
  it('should show the products', async () => {
    const res = await request(app)
      .get('/products')
      .set("Cookie", [cookie])
    expect(res.statusCode).toEqual(200);
    
  })
})

describe('Get Endpoints', () => {
  it('should not show the products', async () => {
    const res = await request(app)
      .get('/products')
    expect(res.statusCode).toEqual(403);
    
  })
})

describe('Get Endpoints', () => {
  it('should show the purchases', async () => {
    const res = await request(app)
      .get('/purchases')
      .set("Cookie", [cookie])
    expect(res.statusCode).toEqual(200);
    
  })
})

describe('Get Endpoints', () => {
  it('should not show the purchases', async () => {
    const res = await request(app)
      .get('/purchases')
    expect(res.statusCode).toEqual(403);
    
  })
})

describe('Get Endpoints', () => {
  it('should show the recommendation', async () => {
    const res = await request(app)
      .get('/recommendation')
      .set("Cookie", [cookie])
    expect(res.statusCode).toEqual(200);
    
  })
})

describe('Get Endpoints', () => {
  it('should not show the recommendation', async () => {
    const res = await request(app)
      .get('/recommendation')
    expect(res.statusCode).toEqual(403);
    
  })
})

describe('Get Endpoints', () => {
  it('should show the profile', async () => {
    const res = await request(app)
      .get('/profile')
      .set("Cookie", [cookie])
    expect(res.statusCode).toEqual(200);
    
  })
})


describe('Get Endpoints', () => {
  it('should not show the profile', async () => {
    const res = await request(app)
      .get('/profile')
    expect(res.statusCode).toEqual(403);
    
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
        contact: null
      })
      .set("Cookie", [cookie])
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')

    const res1 = await request(app)
      .put('/profile/edit')
      .send({
        name: "Filipe",
        lastname: 'Quintas',
        birth_date: '23/12/1999',
        contact: '918470958'
      })
      .set("Cookie", [cookie])
    expect(res1.statusCode).toEqual(200)
    expect(res1.body).toHaveProperty('message')
  })
})

describe('Post Endpoints', () => {
  it('should not edit profile', async () => {
    const res = await request(app)
      .put('/profile/edit')
      .send({
        name: "Filipe",
        lastname: 'Quintas',
        birth_date: '23/12/1999',
        contact: '918470958'
      })
    expect(res.statusCode).toEqual(403)
    expect(res.body).toHaveProperty('message')

    const res1 = await request(app)
      .put('/profile/edit')
      .send({
        name: "Filipe",
        lastname: 'Quintas',
        birth_date: '23/12/1999',
        contact: '918470'
      })
      .set("Cookie", [cookie])
    expect(res1.statusCode).toEqual(400)
    expect(res1.body).toHaveProperty('message')

    const res2 = await request(app)
      .put('/profile/edit')
      .send({
        name: "Filipe",
        lastname: 'Quintas',
        birth_date: '23/12/1999',
        contact: 'asdf12jkl'
      })
      .set("Cookie", [cookie])
    expect(res2.statusCode).toEqual(400)
    expect(res2.body).toHaveProperty('message')
  })
})
/*


describe('Get Endpoints', () => {
  it('should show the clients', async () => {
    const res = await request(app)
      .get('/users')
      .set("Cookie", [cookie])
    expect(res.statusCode).toEqual(200);
    
  })
})

describe('Get Endpoints', () => {
  it('should not show the clients', async () => {
    const res = await request(app)
      .get('/users')
    expect(res.statusCode).toEqual(403);
    
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
  it('should not send email to recover the password', async () => {
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

  describe('Get Endpoints', () => {
    it('should not download PDF', async () => {
      const res = await request(app)
        .get('/download/Transdev/FR.1999.21')
        expect(res.statusCode).toEqual(404);

      const res1 = await request(app)
      .get('/download/Transdev/319563639')
      expect(res1.statusCode).toEqual(400);
      
    })
  })


describe('Post Endpoints', () => {
  it('should update the password', async () => {
    const res = await request(app)
      .put('/password/update')
      .send({
        type: 'update',
        password: "DiogoTeste1",
      })
      .set("Cookie", [cookie])
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
  })
})


describe('Post Endpoints', () => {
  it('should not update the password', async () => {
    const res = await request(app)
      .put('/password/update')
      .send({
        type: 'recover',
        user_id: "1751",
        password:'DiogoTeste1'
      })
    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toBe("Can't update password")

    const res3 = await request(app)
      .put('/password/update')
      .send({
        type: 'recover',
        user_id: "1751",
        password:'DIOGOTESTE1'
      })
    expect(res3.statusCode).toEqual(400)
    expect(res3.body.message).toBe('Password not valid')

    const res1 = await request(app)
      .put('/password/update')
      .send({
        type: 'update',
        password: "diogoteste1",
      })
      .set("Cookie", [cookie])
    expect(res1.statusCode).toEqual(400)
    expect(res1.body).toHaveProperty('message')

    const res2 = await request(app)
      .put('/password/update')
      .send({
        type: 'update',
        password: "DiogoTeste1",
      })
    expect(res2.statusCode).toEqual(403)
    expect(res2.body).toHaveProperty('message')
  })
})

/*
describe('Post Endpoints', () => {
  it('should create a payment request, show payment status and show stripe key', async () => {
    const res = await request(app)
      .post('/payment')
      .send({
        quantity: '2',
        product_id: '49245902',
        company: 'Barquense'
      })
      .set("Cookie", [cookie])
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('paymentIntent')

    const res1 = await request(app)
    .get(`/payment/${res.body.paymentIntent.id}/status`)
    .set("Cookie", [cookie])
  expect(res1.statusCode).toEqual(200);

  const res2 = await request(app)
    .get('/stripe-key')
    .set("Cookie", [cookie])
  expect(res2.statusCode).toEqual(200);
    
  })
})
*/
describe('Post Endpoints', () => {
  it('should not create a payment request', async () => {
    const res = await request(app)
      .post('/payment')
      .send({
        quantity: '2',
        product_id: '0000000',
        company: 'Barquense'
      })
      .set("Cookie", [cookie])
    expect(res.statusCode).toEqual(404)

    const res1 = await request(app)
    .post('/payment')
    .send({
      quantity: '2',
      product_id: '49245902',
      company: 'Transdev'
    })
    .set("Cookie", [cookie])
  expect(res1.statusCode).toEqual(404)

  const res2 = await request(app)
  .post('/payment')
  .send({
    quantity: '2',
    product_id: '49245902',
    company: 'Barquense1'
  })
  .set("Cookie", [cookie])
expect(res2.statusCode).toEqual(404)

const res3 = await request(app)
.post('/payment')
.send({
  quantity: '2.3',
  product_id: '1234354',
  company: 'Barquense'
})
.set("Cookie", [cookie])
expect(res3.statusCode).toEqual(400)
    })
  })

/*
describe('Get Endpoints', () => {
  it('should logout from user and company', async () => {
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
  it('should show user and company not authenticated', async () => {
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
