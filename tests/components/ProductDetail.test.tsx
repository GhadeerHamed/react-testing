
import { render, screen } from '@testing-library/react'
import ProductDetail from '../../src/components/ProductDetail'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'
import { db } from '../mocks/db'

describe('ProductDetail', () => {
  const productId = 1
  beforeAll(() => {
    db.product.create({id: productId})
  })

  afterAll(() => {
    db.product.delete({where: { id: {equals: productId}}})
  })

  it('should render the product detail', async () => {
    render(<ProductDetail productId={productId} />)

    const product = db.product.findFirst({where: {id: {equals: productId}}})!

    expect(await screen.findByText(new RegExp(product!.name))).toBeInTheDocument()
    expect(await screen.findByText(new RegExp(product!.price.toString()))).toBeInTheDocument()
  })

  it('should render message if product not found', async () => {
    server.use(http.get('/products/1', () =>  HttpResponse.json(null)))

    render(<ProductDetail productId={1} />)

    expect(await screen.findByText(/not found/i)).toBeInTheDocument()
  })

  it('should render an error for invalid product id', async () => {
    render(<ProductDetail productId={0} />)

    expect(await screen.findByText(/invalid/i)).toBeInTheDocument()
  })
})