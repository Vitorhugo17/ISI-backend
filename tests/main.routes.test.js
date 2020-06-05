const request = require('supertest')
const app = require('../server')

/* Main Routes Get Endpoints */

describe('Get Endpoints', () => {
  it('should show the clients', async () => {
    const res = await request(app)
      .get('/users')
    expect(res.statusCode).toEqual(200);
    
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

  /* describe('Get Endpoints', () => {
    it('should show payment status', async () => {
      const res = await request(app)
        .get('/payment/:id/status')
      expect(res.statusCode).toEqual(200);
      
    })
  }) */

  describe('Get Endpoints', () => {
    it('should get stripe publishable key', async () => {
      const res = await request(app)
        .get('/stripe-key')
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
  describe('Get Endpoints', () => {
    it('should show unused tickets', async () => {
      const res = await request(app)
        .get('/tickets/unused')
      expect(res.statusCode).toEqual(200);
      
    })
  })
  describe('Get Endpoints', () => {
    it('should show used tickets', async () => {
      const res = await request(app)
        .get('/tickets/used')
      expect(res.statusCode).toEqual(200);
      
    })
  })

   /* describe('Get Endpoints', () => {
    it('should read QR Code', async () => {
      const res = await request(app)
        .get('/qrcodes/:qrcode_id')
      expect(res.statusCode).toEqual(200);
      
    })
  }) */


/* Main Routes Post Endpoints */

