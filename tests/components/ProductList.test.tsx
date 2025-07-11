
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import ProductList from '../../src/components/ProductList'
import { server } from '../mocks/server'
import { http, HttpResponse, delay } from 'msw'
import { db } from '../mocks/db'

describe('ProductList', () => {
  const ids = [1,2,3]
  beforeAll(() => {
    ids.forEach(id => db.product.create({id}))
  })

  afterAll(() => {
    db.product.deleteMany({where: { id: {in: ids}}})
  })

  it('should render the list of products', async () => {
    render(<ProductList />)

    const listItems = await screen.findAllByRole('listitem')
    expect(listItems.length).toBeGreaterThan(0)
  })  

  it('should render no products available if no products found', async () => {
    server.use(http.get('/products', () =>  HttpResponse.json([])))
    render(<ProductList />)

    const message = await screen.findByText(/no products/i)
    expect(message).toBeInTheDocument()
  })

  it('should render error message when there is an error', async () => {
    server.use(http.get('/products', () =>  HttpResponse.error()))
    render(<ProductList />)

    const message = await screen.findByText(/error/i)
    expect(message).toBeInTheDocument()
  })
  
  it('should render a loading indicator when data is loading', async () => {
    server.use(http.get('/products', async () =>  {
      await delay(1000)
      return HttpResponse.json([])
    }))

    render(<ProductList />)

    const message = await screen.findByText(/loading/i)
    expect(message).toBeInTheDocument()
  })

  it('should remove the loading indicator when data is loaded', async () => {
    render(<ProductList />)
    
    await waitForElementToBeRemoved(() => screen.getByText(/loading/i))
  })

  it('should remove the loading indicator if fetch data fails ', async () => {
    server.use(http.get('/products', () =>  HttpResponse.error()))
    
    render(<ProductList />)
    
    await waitForElementToBeRemoved(() => screen.getByText(/loading/i))
  })
})