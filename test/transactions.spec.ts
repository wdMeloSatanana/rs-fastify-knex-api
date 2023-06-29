import { it, beforeEach, beforeAll, afterAll, describe,expect } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Transactions routes', async ( ) => {

    beforeAll(async () => {
        await app.ready()  
    })
    
    afterAll( async ()=> {
        await app.close()
    })
    
    beforeEach( () => {
        execSync('npm run knex migrate:rollback --all ')
        execSync('npm run knex migrate:latest')
    })

    it('should be able to create and register a new transaction', async () => {
        //console.log('Supressing?')
        const response = await request(app.server)
            .post('/transactions')
            .send({
                title: 'New transaction',
                amount: 5000,
                type: 'credit',
            })
            .expect(201)
        

        //console.log(response.body)
    })
    
    it('should be able to list all transactions', async()=>{
                
        const createTransactionRespose = await request(app.server)
        .post('/transactions')
        .send({
            title: 'New transaction',
            amount: 5000,
            type: 'credit',
        })

        const cookies = createTransactionRespose.get('Set-Cookie')
        
        const listTransactionsResponse = await request(app.server)
         .get('/transactions')
         .set('Cookie', cookies)
         .expect(200)
        
        expect(listTransactionsResponse.body.transactions).toEqual([
            expect.objectContaining({
                title: 'New transaction',
                amount: 5000,
            })
        ])
    })

    it('should be able to get a specific transaction', async()=>{
                
        const createTransactionRespose = await request(app.server)
        .post('/transactions')
        .send({
            title: 'New transaction',
            amount: 5000,
            type: 'credit',
        })

        const cookies = createTransactionRespose.get('Set-Cookie')
        
        const listTransactionsResponse = await request(app.server)
         .get('/transactions')
         .set('Cookie', cookies)
         .expect(200)
        
        const transactionId = listTransactionsResponse.body.transactions[0].id
        
        const getTransactionResponse = await request(app.server)
         .get(`/transactions/${transactionId}`)
         .set('Cookie', cookies)
         .expect(200)
        
        expect(getTransactionResponse.body.transaction).toEqual(
            expect.objectContaining({
                title: 'New transaction',
                amount: 5000,
            })
        )
    })

    it('should be able to get the summary', async()=>{
                
        const createTransactionRespose = await request(app.server)
        .post('/transactions')
        .send({
            title: 'New transaction',
            amount: 5000,
            type: 'credit',
        })


        const cookies = createTransactionRespose.get('Set-Cookie')

        await request(app.server)
        .post('/transactions')
        .set('Cookie', cookies)
        .send({
            title: 'Debit trnsactions',
            amount: 2000,
            type: 'debit',
        })

        const summaryResponse = await request(app.server)
         .get('/transactions/summary')
         .set('Cookie', cookies)
          .expect(200)
        
        expect(summaryResponse.body.summary).toEqual({
            amount: 3000,
        })
    })

})
