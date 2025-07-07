import {faker} from '@faker-js/faker'
import { db } from './mocks/db'
describe('group', () => {
    it('should', async () => {
        const p = db.product.create()
        console.log(db.product.count())
    })
})
