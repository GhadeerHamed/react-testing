
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import ProductDetail from '../../src/components/ProductDetail'
import { server } from '../mocks/server'
import { delay, http, HttpResponse } from 'msw'
import { db } from '../mocks/db'
import AllProviders from '../allProviders'

describe('ProductDetail', () => {
  const productId = 1
  beforeAll(() => {
    db.product.create({id: productId})
  })

  afterAll(() => {
    db.product.delete({where: { id: {equals: productId}}})
  })

  it('should render the product detail', async () => {
    render(<ProductDetail productId={productId} />, {wrapper: AllProviders})

    const product = db.product.findFirst({where: {id: {equals: productId}}})!

    expect(await screen.findByText(new RegExp(product!.name))).toBeInTheDocument()
    expect(await screen.findByText(new RegExp(product!.price.toString()))).toBeInTheDocument()
  })

  it('should render message if product not found', async () => {
    server.use(http.get('/products/1', () =>  HttpResponse.json(null)))

    render(<ProductDetail productId={1} />, {wrapper: AllProviders})

    expect(await screen.findByText(/not found/i)).toBeInTheDocument()
  })

  it('should render an error for invalid product id', async () => {
    render(<ProductDetail productId={0} />, {wrapper: AllProviders})

    expect(await screen.findByText(/invalid/i)).toBeInTheDocument()
  })
  
  it('should render error if data fetch fails', async () => {
    server.use(http.get('/products/1', () =>  HttpResponse.error()))

    render(<ProductDetail productId={1} />, {wrapper: AllProviders})

    expect(await screen.findByText(/error/i)).toBeInTheDocument()
  })
  
  it('should render a loading indicator when data is loading', async () => {
    server.use(http.get('/products', async () =>  {
      await delay(1000)
      return HttpResponse.json([])
    }))

    render(<ProductDetail productId={1} />, {wrapper: AllProviders})

    const message = await screen.findByText(/loading/i)
    expect(message).toBeInTheDocument()
  })

  it('should remove the loading indicator when data is loaded', async () => {
    render(<ProductDetail productId={1} />, {wrapper: AllProviders})
    
    await waitForElementToBeRemoved(() => screen.getByText(/loading/i))
  })

  it('should remove the loading indicator if fetch data fails ', async () => {
    server.use(http.get('/products', () =>  HttpResponse.error()))
    
    render(<ProductDetail productId={1} />, {wrapper: AllProviders})
    
    await waitForElementToBeRemoved(() => screen.getByText(/loading/i))
  })
})