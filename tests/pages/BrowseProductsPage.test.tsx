import { render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import BrowseProducts from '../../src/pages/BrowseProductsPage'
import { server } from '../mocks/server'
import { http, HttpResponse, delay } from 'msw'
import { db } from '../mocks/db'
import AllProviders from '../allProviders'
import userEvent from '@testing-library/user-event'
import { Category, Product } from '../../src/entities'

describe('BrowseProductsPage', () => {
  const products: Product[] = []
  const categories: Category[] = []

  beforeAll(() => {
    [1, 2, 3].forEach((item) => products.push(db.product.create({ name: `Product ${item}` })));
    [1, 2].forEach((item) => categories.push(db.category.create({ name: `Category ${item}` })));
  })

  afterAll(() => {
    db.product.deleteMany({ where: { id: { in: products.map(p => p.id) } } })
    db.category.deleteMany({ where: { id: { in: categories.map(c => c.id) } } })
  })

  const renderComponent = () => {
    render(<BrowseProducts />, { wrapper: AllProviders })
  }

  it('should show loading skeleton when loading categories', async () => {
    server.use(
      http.get('/categories', async () => {
        await delay()
        return HttpResponse.json([])
      })
    )

    renderComponent()
    
    const skeletons = screen.getByRole('progressbar', { name: /categories/i })
    expect(skeletons).toBeInTheDocument()
  })

  it('should hide the loading skeleton when categories are loaded', async () => {
    renderComponent()
    
    await waitForElementToBeRemoved(() => 
      screen.getByRole('progressbar', { name: /categories/i }))
  })
  
  it('should show loading skeleton when loading products', async () => {
    server.use(
      http.get('/products', async () => {
        await delay()
        return HttpResponse.json([])
      })
    )

    renderComponent()
    
    const skeletons = screen.getByRole('progressbar', { name: /products/i })
    expect(skeletons).toBeInTheDocument()
  })

  it('should hide the loading skeleton when products are loaded', async () => {
    renderComponent()
    
    await waitForElementToBeRemoved(() => 
      screen.getByRole('progressbar', { name: /products/i }))
  })
  
  it('should not render an error if categories cannot be fetched', async () => {
    server.use(
      http.get('/categories', async () => {
        return HttpResponse.error()
      })
    )

    renderComponent()

    await waitForElementToBeRemoved(() => 
      screen.getByRole('progressbar', { name: /categories/i }))

    expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: /category/i })).not.toBeInTheDocument()
  })

  it('should render an error if products cannot be fetched', async () => {
    server.use(
      http.get('/products', async () => {
        return HttpResponse.error()
      })
    )

    renderComponent()

    expect(await screen.findByText(/error/i)).toBeInTheDocument()
  })

  it('should render categories', async () => {
    renderComponent()

    const categoryFilter = await screen.findByRole('combobox')
    expect(categoryFilter).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(categoryFilter)

    expect(screen.getByRole('option', {name: /all/i})).toBeInTheDocument()
    categories.forEach(c => {
      expect(screen.getByRole('option', { name: c.name })).toBeInTheDocument()
    })
  })
  
  it('should render products', async () => {
    renderComponent()

    await waitForElementToBeRemoved(() => 
      screen.getByRole('progressbar', { name: /products/i }))

    products.forEach(p => {
      expect(screen.getByText(p.name)).toBeInTheDocument()
    })
  })

}) 