import { render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import BrowseProducts from '../../src/pages/BrowseProductsPage'
import { server } from '../mocks/server'
import { http, HttpResponse, delay } from 'msw'
import { db } from '../mocks/db'
import AllProviders from '../allProviders'
import userEvent from '@testing-library/user-event'
import { Category, Product } from '../../src/entities'
import { simulateDelay, simulateError } from '../utils'

describe('BrowseProductsPage', () => {
  const products: Product[] = []
  const categories: Category[] = []

  beforeAll(() => {
    [1, 2].forEach((item) => {
      const category = db.category.create({ name: `Category ${item}` }); 
      categories.push(category);

    [1, 2].forEach((item) => 
      products.push(db.product.create({ 
        categoryId: category.id
      })));
    });
  });

  afterAll(() => {
    db.product.deleteMany({ where: { id: { in: products.map(p => p.id) } } })
    db.category.deleteMany({ where: { id: { in: categories.map(c => c.id) } } })
  })

  const renderComponent = () => {
    render(<BrowseProducts />, { wrapper: AllProviders })

    return {
      user: userEvent.setup(),
      getProductsSkeleton: () => screen.getByRole('progressbar', { name: /products/i }),
      getCategoriesSkeleton: () => screen.getByRole('progressbar', { name: /categories/i }),
      getCategoryCombobox: () => screen.queryByRole('combobox')
    }
  }

  it('should show loading skeleton when loading categories', async () => {
    server.use(
      http.get('/categories', async () => {
        await delay()
        return HttpResponse.json([])
      })
    )

    const { getCategoriesSkeleton } = renderComponent()
    
    expect(getCategoriesSkeleton()).toBeInTheDocument()
  })

  it('should hide the loading skeleton when categories are loaded', async () => {
    const { getCategoriesSkeleton } = renderComponent()
    
    await waitForElementToBeRemoved(getCategoriesSkeleton)
  })
  
  it('should show loading skeleton when loading products', async () => {
    simulateDelay('/products')

    const { getProductsSkeleton } = renderComponent()
    
    expect(getProductsSkeleton()).toBeInTheDocument()
  })

  it('should hide the loading skeleton when products are loaded', async () => {
    const { getProductsSkeleton } = renderComponent()
    
    await waitForElementToBeRemoved(getProductsSkeleton)
  })
  
  it('should not render an error if categories cannot be fetched', async () => {
    simulateError('/categories')

    const { getCategoriesSkeleton, getCategoryCombobox } = renderComponent()

    await waitForElementToBeRemoved(getCategoriesSkeleton)

    expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
    expect(getCategoryCombobox()).not.toBeInTheDocument()
  })

  it('should render an error if products cannot be fetched', async () => {
    simulateError('/products')

    const { getProductsSkeleton } = renderComponent()

    await waitForElementToBeRemoved(getProductsSkeleton)

    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })

  it('should render categories', async () => {
    const { getCategoriesSkeleton, user, getCategoryCombobox } = renderComponent()

    await waitForElementToBeRemoved(getCategoriesSkeleton)
    const categoryFilter = getCategoryCombobox()
    expect(categoryFilter).toBeInTheDocument()

    await user.click(categoryFilter!)

    expect(screen.getByRole('option', {name: /all/i})).toBeInTheDocument()
    categories.forEach(c => {
      expect(screen.getByRole('option', { name: c.name })).toBeInTheDocument()
    })
  })
  
  it('should render products', async () => {
    const { getProductsSkeleton } = renderComponent()

    await waitForElementToBeRemoved(getProductsSkeleton)

    products.forEach(p => {
      expect(screen.getByText(p.name)).toBeInTheDocument()
    })
  })

  it('should filter products by category when category is selected', async () => {
    const { getCategoriesSkeleton, getCategoryCombobox, user } = renderComponent()

    await waitForElementToBeRemoved(getCategoriesSkeleton)

    const categoryFilter = getCategoryCombobox()

    await user.click(categoryFilter!)

    const selectedCategory = categories[0]
    const option = screen.getByRole('option', { name: selectedCategory.name })
    await user.click(option)

    const products = db.product.findMany({
      where: {
        categoryId: {
          equals: selectedCategory.id
        }
      }
    })

    const rows = screen.getAllByRole('row')

    expect(rows).toHaveLength(products.length + 1) // +1 for the header row

    products.forEach(product => {
      expect(screen.getByText(product.name)).toBeInTheDocument()
    })
  })
  
  it('should render all products if "All" category is selected', async () => {
    const { getCategoriesSkeleton, getCategoryCombobox, user } = renderComponent()

    await waitForElementToBeRemoved(getCategoriesSkeleton)

    const categoryFilter = getCategoryCombobox()

    await user.click(categoryFilter!)

    const option = screen.getByRole('option', { name: /all/i })
    await user.click(option)

    const products = db.product.getAll()

    const rows = screen.getAllByRole('row')

    expect(rows).toHaveLength(products.length + 1) // +1 for the header row

    products.forEach(product => {
      expect(screen.getByText(product.name)).toBeInTheDocument()
    })
  })
}) 