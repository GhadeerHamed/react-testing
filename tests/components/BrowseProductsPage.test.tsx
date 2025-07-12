import { render, screen } from '@testing-library/react'
import BrowseProducts from '../../src/pages/BrowseProductsPage'
import { server } from '../mocks/server'
import { http, HttpResponse, delay } from 'msw'
import { db } from '../mocks/db'
import AllProviders from '../allProviders'
import userEvent from '@testing-library/user-event'

describe('BrowseProducts', () => {
  const user = userEvent.setup()
  const productIds = [1, 2, 3]
  const categoryIds = [1, 2]

  beforeAll(() => {
    // Create test products
    productIds.forEach(id => 
      db.product.create({
        id,
        name: `Product ${id}`,
        price: id * 10,
        categoryId: id <= 2 ? 1 : 2
      })
    )
    
    // Create test categories
    categoryIds.forEach(id => 
      db.category.create({
        id,
        name: `Category ${id}`
      })
    )
  })

  afterAll(() => {
    db.product.deleteMany({ where: { id: { in: productIds } } })
    db.category.deleteMany({ where: { id: { in: categoryIds } } })
  })

  it('should render the products page with title', async () => {
    render(<BrowseProducts />, { wrapper: AllProviders })
    
    const title = await screen.findByText(/products/i)
    expect(title).toBeInTheDocument()
  })

  it('should render category filter dropdown', async () => {
    render(<BrowseProducts />, { wrapper: AllProviders })
    
    // Wait for categories to load first
    await screen.findByText(/product 1/i)
    
    const categoryFilter = await screen.findByRole('combobox')
    expect(categoryFilter).toBeInTheDocument()
  })

  it('should render products table with headers', async () => {
    render(<BrowseProducts />, { wrapper: AllProviders })
    
    const nameHeader = await screen.findByText('Name')
    const priceHeader = await screen.findByText('Price')
    
    expect(nameHeader).toBeInTheDocument()
    expect(priceHeader).toBeInTheDocument()
  })

  it('should render all products when no category is selected', async () => {
    render(<BrowseProducts />, { wrapper: AllProviders })
    
    const product1 = await screen.findByText(/product 1/i)
    const product2 = await screen.findByText(/product 2/i)
    const product3 = await screen.findByText(/product 3/i)
    
    expect(product1).toBeInTheDocument()
    expect(product2).toBeInTheDocument()
    expect(product3).toBeInTheDocument()
  })

  it('should filter products by category when category is selected', async () => {
    render(<BrowseProducts />, { wrapper: AllProviders })
    
    // Wait for products to load first
    await screen.findByText(/product 1/i)
    
    // Wait for categories to load
    const categoryFilter = await screen.findByRole('combobox')
    await user.click(categoryFilter)
    
    // Select Category 1
    const category1 = await screen.findByText(/category 1/i)
    await user.click(category1)
    
    // Check that only products from category 1 are shown
    const product1 = await screen.findByText(/product 1/i)
    const product2 = await screen.findByText(/product 2/i)
    
    expect(product1).toBeInTheDocument()
    expect(product2).toBeInTheDocument()
    
    // Product 3 should not be visible (it's in category 2)
    expect(screen.queryByText(/product 3/i)).not.toBeInTheDocument()
  })

  it('should show all products when "All" is selected', async () => {
    render(<BrowseProducts />, { wrapper: AllProviders })
    
    // Wait for products to load first
    await screen.findByText(/product 1/i)
    
    // Wait for categories to load
    const categoryFilter = await screen.findByRole('combobox')
    await user.click(categoryFilter)
    
    // Select "All"
    const allOption = await screen.findByText(/all/i)
    await user.click(allOption)
    
    // Check that all products are shown
    const product1 = await screen.findByText(/product 1/i)
    const product2 = await screen.findByText(/product 2/i)
    const product3 = await screen.findByText(/product 3/i)
    
    expect(product1).toBeInTheDocument()
    expect(product2).toBeInTheDocument()
    expect(product3).toBeInTheDocument()
  })

  it('should display product prices correctly', async () => {
    render(<BrowseProducts />, { wrapper: AllProviders })
    
    const price1 = await screen.findByText(/10/i)
    const price2 = await screen.findByText(/20/i)
    const price3 = await screen.findByText(/30/i)
    
    expect(price1).toBeInTheDocument()
    expect(price2).toBeInTheDocument()
    expect(price3).toBeInTheDocument()
  })

  it('should render loading skeleton for products when loading', async () => {
    server.use(
      http.get('/products', async () => {
        await delay(1000)
        return HttpResponse.json([])
      })
    )

    render(<BrowseProducts />, { wrapper: AllProviders })
    
    // Check that skeleton elements are rendered (react-loading-skeleton creates div elements)
    const skeletons = document.querySelectorAll('.react-loading-skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('should render loading skeleton for categories when loading', async () => {
    server.use(
      http.get('/categories', async () => {
        await delay(1000)
        return HttpResponse.json([])
      })
    )

    render(<BrowseProducts />, { wrapper: AllProviders })
    
    // The skeleton should be visible in the category filter area
    const skeletons = document.querySelectorAll('.react-loading-skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('should show error message when products fetch fails', async () => {
    server.use(
      http.get('/products', () => HttpResponse.error())
    )

    render(<BrowseProducts />, { wrapper: AllProviders })
    
    const errorMessage = await screen.findByText(/error/i)
    expect(errorMessage).toBeInTheDocument()
  })

  it('should show error message when categories fetch fails', async () => {
    server.use(
      http.get('/categories', () => HttpResponse.error())
    )

    render(<BrowseProducts />, { wrapper: AllProviders })
    
    const errorMessage = await screen.findByText(/error/i)
    expect(errorMessage).toBeInTheDocument()
  })

  it('should remove loading indicators when data is loaded', async () => {
    render(<BrowseProducts />, { wrapper: AllProviders })
    
    // Wait for products to load (this implicitly waits for loading to complete)
    const product1 = await screen.findByText(/product 1/i)
    expect(product1).toBeInTheDocument()
    
    // Verify that skeleton elements are no longer present
    const skeletons = document.querySelectorAll('.react-loading-skeleton')
    expect(skeletons.length).toBe(0)
  })

  it('should render QuantitySelector for each product', async () => {
    render(<BrowseProducts />, { wrapper: AllProviders })
    
    // Wait for products to load
    await screen.findByText(/product 1/i)
    
    // Check that QuantitySelector components are rendered
    // QuantitySelector renders "Add to Cart" buttons or +/- buttons
    const addToCartButtons = screen.getAllByText('Add to Cart')
    expect(addToCartButtons.length).toBeGreaterThan(0)
  })

  it('should handle empty products list', async () => {
    server.use(
      http.get('/products', () => HttpResponse.json([]))
    )

    render(<BrowseProducts />, { wrapper: AllProviders })
    
    // Should still show the table headers
    const nameHeader = await screen.findByText('Name')
    const priceHeader = await screen.findByText('Price')
    
    expect(nameHeader).toBeInTheDocument()
    expect(priceHeader).toBeInTheDocument()
    
    // But no product rows should be rendered
    expect(screen.queryByText(/product 1/i)).not.toBeInTheDocument()
  })

  it('should handle empty categories list', async () => {
    server.use(
      http.get('/categories', () => HttpResponse.json([]))
    )

    render(<BrowseProducts />, { wrapper: AllProviders })
    
    // Wait for products to load first
    await screen.findByText(/product 1/i)
    
    // Category filter should still be rendered but with only "All" option
    const categoryFilter = await screen.findByRole('combobox')
    expect(categoryFilter).toBeInTheDocument()
    
    // Click to open dropdown
    await user.click(categoryFilter)
    
    // Should only have "All" option
    const allOption = await screen.findByText(/all/i)
    expect(allOption).toBeInTheDocument()
  })
}) 