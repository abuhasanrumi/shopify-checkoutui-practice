import '@shopify/shopify-api/adapters/node';
import { shopifyApi } from '@shopify/shopify-api';
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

const app = express()
dotenv.config()

app.use(cors())

const shopify = shopifyApi({
  apiKey: process.env.API_KEY,
  apiSecretKey: process.env.API_SECRET_KEY,
  scopes: ['read_products'],
  hostName: process.env.HOST_NAME
})

app.get('/api/get/widgets', async (req, res) => {
  try {
    console.log(req.headers)
    const products = req?.query?.products?.split(',')?.map(i => 'id:' + i?.split('/')?.at(-1)).join(' OR ') || ''
    const client = new shopify.clients.Graphql({ session: { shop: req.query['shop-url'], accessToken: process.env.ACCESS_TOKEN } })

    const graphqlQuery = `{
      customers(query: "${req.query['user-email']}", first: 1) {
        nodes {
          tags
          numberOfOrders
          amountSpent {
            amount
          }
        }
      }
      collections(first: 250) {
        nodes {
          title
        }
      }
      products(query: "${products}", first: ${products.split(' OR ').length}) {
        nodes {
          handle
        }
      }
    }`

    const customer = await client.query({
      data: graphqlQuery,
    })

    const amountSpent = await customer?.body?.data?.customers?.nodes?.at(0)?.amountSpent?.amount || 0
    const customerTags = await customer?.body?.data?.customers?.nodes?.at(0)?.tags || []
    const customerOrders = await customer?.body?.data?.customers?.nodes?.at(0)?.numberOfOrders || 0
    const handles = await customer?.body?.data?.products?.nodes

    const token = jwt.sign({ shop: req.query['shop-url'] }, process.env.JWT_SIGNATURE, {
      expiresIn: '60000'
    })

    const response = await fetch('https://api.nvdmini.com/api/upsell-widgets', {
      headers: {
        Authorization: token,
        Shop: req.query['shop-url']
      }
    })
    const data = await response.json()
    res.json(
      {
        "status": 200,
        "widgets": [{
          "id": 134,
          "shop_url": "abid-devs-store.myshopify.com",
          "template_id": 6,
          "widget_name": "Widget 1",
          "product_feed_type": "auto",
          "selected_feeds": "[{\"id\":40,\"shop_url\":\"abid-devs-store.myshopify.com\",\"name\":\"Feed 1\",\"description\":\"test\",\"products\":\"[{\\\"cursor\\\":\\\"eyJsYXN0X2lkIjo4MjEwMzY2ODI0NzI0LCJsYXN0X3ZhbHVlIjoiODIxMDM2NjgyNDcyNCJ9\\\",\\\"node\\\":{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/Product\\\/8210366824724\\\",\\\"title\\\":\\\"The Multi-managed Snowboard\\\",\\\"featuredImage\\\":{\\\"url\\\":\\\"https:\\\/\\\/cdn.shopify.com\\\/s\\\/files\\\/1\\\/0743\\\/4141\\\/7236\\\/products\\\/Main_9129b69a-0c7b-4f66-b6cf-c4222f18028a.jpg?v=1680514107\\\"},\\\"priceRangeV2\\\":{\\\"maxVariantPrice\\\":{\\\"currencyCode\\\":\\\"BDT\\\"}},\\\"variants\\\":{\\\"nodes\\\":[{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/ProductVariant\\\/44807032078612\\\",\\\"price\\\":\\\"629.95\\\",\\\"image\\\":null,\\\"title\\\":\\\"Default Title\\\",\\\"displayName\\\":\\\"The Multi-managed Snowboard - Default Title\\\",\\\"taxable\\\":true,\\\"availableForSale\\\":true,\\\"inventoryQuantity\\\":499999586}]}}},{\\\"cursor\\\":\\\"eyJsYXN0X2lkIjo4MjEwMzY2ODU3NDkyLCJsYXN0X3ZhbHVlIjoiODIxMDM2Njg1NzQ5MiJ9\\\",\\\"node\\\":{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/Product\\\/8210366857492\\\",\\\"title\\\":\\\"The Collection Snowboard: Oxygen\\\",\\\"featuredImage\\\":{\\\"url\\\":\\\"https:\\\/\\\/cdn.shopify.com\\\/s\\\/files\\\/1\\\/0743\\\/4141\\\/7236\\\/products\\\/Main_d624f226-0a89-4fe1-b333-0d1548b43c06.jpg?v=1680514108\\\"},\\\"priceRangeV2\\\":{\\\"maxVariantPrice\\\":{\\\"currencyCode\\\":\\\"BDT\\\"}},\\\"variants\\\":{\\\"nodes\\\":[{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/ProductVariant\\\/44807032111380\\\",\\\"price\\\":\\\"1025.00\\\",\\\"image\\\":null,\\\"title\\\":\\\"Default Title\\\",\\\"displayName\\\":\\\"The Collection Snowboard: Oxygen - Default Title\\\",\\\"taxable\\\":true,\\\"availableForSale\\\":true,\\\"inventoryQuantity\\\":499999519}]}}},{\\\"cursor\\\":\\\"eyJsYXN0X2lkIjo4MjEwMzY2OTg4NTY0LCJsYXN0X3ZhbHVlIjoiODIxMDM2Njk4ODU2NCJ9\\\",\\\"node\\\":{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/Product\\\/8210366988564\\\",\\\"title\\\":\\\"The Collection Snowboard: Liquid\\\",\\\"featuredImage\\\":{\\\"url\\\":\\\"https:\\\/\\\/cdn.shopify.com\\\/s\\\/files\\\/1\\\/0743\\\/4141\\\/7236\\\/products\\\/Main_b13ad453-477c-4ed1-9b43-81f3345adfd6.jpg?v=1680514109\\\"},\\\"priceRangeV2\\\":{\\\"maxVariantPrice\\\":{\\\"currencyCode\\\":\\\"BDT\\\"}},\\\"variants\\\":{\\\"nodes\\\":[{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/ProductVariant\\\/44807032340756\\\",\\\"price\\\":\\\"749.95\\\",\\\"image\\\":null,\\\"title\\\":\\\"Default Title\\\",\\\"displayName\\\":\\\"The Collection Snowboard: Liquid - Default Title\\\",\\\"taxable\\\":true,\\\"availableForSale\\\":true,\\\"inventoryQuantity\\\":499999570}]}}},{\\\"cursor\\\":\\\"eyJsYXN0X2lkIjo4MjEwMzY2NjkzNjUyLCJsYXN0X3ZhbHVlIjoiODIxMDM2NjY5MzY1MiJ9\\\",\\\"node\\\":{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/Product\\\/8210366693652\\\",\\\"title\\\":\\\"The Complete Snowboard\\\",\\\"featuredImage\\\":{\\\"url\\\":\\\"https:\\\/\\\/cdn.shopify.com\\\/s\\\/files\\\/1\\\/0743\\\/4141\\\/7236\\\/products\\\/Main_589fc064-24a2-4236-9eaf-13b2bd35d21d.jpg?v=1680514107\\\"},\\\"priceRangeV2\\\":{\\\"maxVariantPrice\\\":{\\\"currencyCode\\\":\\\"BDT\\\"}},\\\"variants\\\":{\\\"nodes\\\":[{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/ProductVariant\\\/44807031947540\\\",\\\"price\\\":\\\"599.95\\\",\\\"image\\\":null,\\\"title\\\":\\\"Electric\\\",\\\"displayName\\\":\\\"The Complete Snowboard - Electric\\\",\\\"taxable\\\":true,\\\"availableForSale\\\":true,\\\"inventoryQuantity\\\":499999569}]}}},{\\\"cursor\\\":\\\"eyJsYXN0X2lkIjo4MjEwMzY2NTYyNTgwLCJsYXN0X3ZhbHVlIjoiODIxMDM2NjU2MjU4MCJ9\\\",\\\"node\\\":{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/Product\\\/8210366562580\\\",\\\"title\\\":\\\"The Collection Snowboard: Hydrogen\\\",\\\"featuredImage\\\":{\\\"url\\\":\\\"https:\\\/\\\/cdn.shopify.com\\\/s\\\/files\\\/1\\\/0743\\\/4141\\\/7236\\\/products\\\/Main.jpg?v=1680514106\\\"},\\\"priceRangeV2\\\":{\\\"maxVariantPrice\\\":{\\\"currencyCode\\\":\\\"BDT\\\"}},\\\"variants\\\":{\\\"nodes\\\":[{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/ProductVariant\\\/44807031554324\\\",\\\"price\\\":\\\"600.00\\\",\\\"image\\\":null,\\\"title\\\":\\\"Default Title\\\",\\\"displayName\\\":\\\"The Collection Snowboard: Hydrogen - Default Title\\\",\\\"taxable\\\":true,\\\"availableForSale\\\":true,\\\"inventoryQuantity\\\":499999596}]}}},{\\\"cursor\\\":\\\"eyJsYXN0X2lkIjo4MjEwMzY2NjYwODg0LCJsYXN0X3ZhbHVlIjoiODIxMDM2NjY2MDg4NCJ9\\\",\\\"node\\\":{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/Product\\\/8210366660884\\\",\\\"title\\\":\\\"The Multi-location Snowboard\\\",\\\"featuredImage\\\":{\\\"url\\\":\\\"https:\\\/\\\/cdn.shopify.com\\\/s\\\/files\\\/1\\\/0743\\\/4141\\\/7236\\\/products\\\/Main_0a4e9096-021a-4c1e-8750-24b233166a12.jpg?v=1680514107\\\"},\\\"priceRangeV2\\\":{\\\"maxVariantPrice\\\":{\\\"currencyCode\\\":\\\"BDT\\\"}},\\\"variants\\\":{\\\"nodes\\\":[{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/ProductVariant\\\/44807031652628\\\",\\\"price\\\":\\\"729.95\\\",\\\"image\\\":null,\\\"title\\\":\\\"Default Title\\\",\\\"displayName\\\":\\\"The Multi-location Snowboard - Default Title\\\",\\\"taxable\\\":true,\\\"availableForSale\\\":true,\\\"inventoryQuantity\\\":499999902}]}}},{\\\"cursor\\\":\\\"eyJsYXN0X2lkIjo4MjEwMzY2NzkxOTU2LCJsYXN0X3ZhbHVlIjoiODIxMDM2Njc5MTk1NiJ9\\\",\\\"node\\\":{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/Product\\\/8210366791956\\\",\\\"title\\\":\\\"The 3p Fulfilled Snowboard\\\",\\\"featuredImage\\\":{\\\"url\\\":\\\"https:\\\/\\\/cdn.shopify.com\\\/s\\\/files\\\/1\\\/0743\\\/4141\\\/7236\\\/products\\\/Main_b9e0da7f-db89-4d41-83f0-7f417b02831d.jpg?v=1680514107\\\"},\\\"priceRangeV2\\\":{\\\"maxVariantPrice\\\":{\\\"currencyCode\\\":\\\"BDT\\\"}},\\\"variants\\\":{\\\"nodes\\\":[{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/ProductVariant\\\/44807032045844\\\",\\\"price\\\":\\\"2629.95\\\",\\\"image\\\":null,\\\"title\\\":\\\"Default Title\\\",\\\"displayName\\\":\\\"The 3p Fulfilled Snowboard - Default Title\\\",\\\"taxable\\\":true,\\\"availableForSale\\\":true,\\\"inventoryQuantity\\\":499998573}]}}}]\",\"active\":0,\"created_at\":\"2023-06-13 09:43:41\",\"updated_at\":\"2023-06-15 08:20:28\"},{\"id\":39,\"shop_url\":\"abid-devs-store.myshopify.com\",\"name\":\"Feed 2\",\"description\":\"askdjl\",\"products\":\"[{\\\"cursor\\\":\\\"eyJsYXN0X2lkIjo4MjEwMzY2NjI4MTE2LCJsYXN0X3ZhbHVlIjoiODIxMDM2NjYyODExNiJ9\\\",\\\"node\\\":{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/Product\\\/8210366628116\\\",\\\"title\\\":\\\"The Archived Snowboard\\\",\\\"featuredImage\\\":{\\\"url\\\":\\\"https:\\\/\\\/cdn.shopify.com\\\/s\\\/files\\\/1\\\/0743\\\/4141\\\/7236\\\/products\\\/Main_52f8e304-92d9-4a36-82af-50df8fe31c69.jpg?v=1680514107\\\"},\\\"priceRangeV2\\\":{\\\"maxVariantPrice\\\":{\\\"currencyCode\\\":\\\"BDT\\\"}},\\\"variants\\\":{\\\"nodes\\\":[{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/ProductVariant\\\/44807031587092\\\",\\\"price\\\":\\\"629.95\\\",\\\"image\\\":null,\\\"title\\\":\\\"Default Title\\\",\\\"displayName\\\":\\\"The Archived Snowboard - Default Title\\\",\\\"taxable\\\":true,\\\"availableForSale\\\":true,\\\"inventoryQuantity\\\":499999947}]}}},{\\\"cursor\\\":\\\"eyJsYXN0X2lkIjo4MjEwMzY2NTYyNTgwLCJsYXN0X3ZhbHVlIjoiODIxMDM2NjU2MjU4MCJ9\\\",\\\"node\\\":{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/Product\\\/8210366562580\\\",\\\"title\\\":\\\"The Collection Snowboard: Hydrogen\\\",\\\"featuredImage\\\":{\\\"url\\\":\\\"https:\\\/\\\/cdn.shopify.com\\\/s\\\/files\\\/1\\\/0743\\\/4141\\\/7236\\\/products\\\/Main.jpg?v=1680514106\\\"},\\\"priceRangeV2\\\":{\\\"maxVariantPrice\\\":{\\\"currencyCode\\\":\\\"BDT\\\"}},\\\"variants\\\":{\\\"nodes\\\":[{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/ProductVariant\\\/44807031554324\\\",\\\"price\\\":\\\"600.00\\\",\\\"image\\\":null,\\\"title\\\":\\\"Default Title\\\",\\\"displayName\\\":\\\"The Collection Snowboard: Hydrogen - Default Title\\\",\\\"taxable\\\":true,\\\"availableForSale\\\":true,\\\"inventoryQuantity\\\":499999596}]}}}]\",\"active\":0,\"created_at\":\"2023-06-13 09:43:09\",\"updated_at\":\"2023-06-15 08:20:35\"}]",
          "selected_segments": "{\"included\":[{\"id\":84,\"shop_url\":\"abid-devs-store.myshopify.com\",\"name\":\"Segment 1\",\"exit_if_matched\":1,\"conditions\":\"{\\\"condition_0\\\":[{\\\"logic\\\":\\\"product-title\\\",\\\"value\\\":\\\"contains\\\",\\\"price\\\":\\\"hydrogen\\\"},{\\\"logic\\\":\\\"product-specific-quantity\\\",\\\"value\\\":\\\"is-less-than\\\",\\\"price\\\":\\\"5\\\"}]}\",\"active\":1,\"created_at\":\"2023-06-14 04:39:06\",\"updated_at\":\"2023-06-17 06:19:28\"},{\"id\":84,\"shop_url\":\"abid-devs-store.myshopify.com\",\"name\":\"Segment 1\",\"exit_if_matched\":1,\"conditions\":\"{\\\"condition_0\\\":[{\\\"logic\\\":\\\"product-title\\\",\\\"value\\\":\\\"does-not-contains\\\",\\\"price\\\":\\\"hydrogen\\\"},{\\\"logic\\\":\\\"product-specific-quantity\\\",\\\"value\\\":\\\"is-less-than\\\",\\\"price\\\":\\\"5\\\"}]}\",\"active\":1,\"created_at\":\"2023-06-14 04:39:06\",\"updated_at\":\"2023-06-17 06:19:28\"}],\"excluded\":[]}",
          "widget_location": "Checkout Page",
          "widget_position": "Checkout::Actions::RenderBefore",
          "widget_customization": "{\"title\":\"You may also like\",\"cta\":\"Add to cart\",\"title_visibility\":1,\"scroll_button_visibility\":1,\"auto_scroll\":0,\"body_bg\":\"#F9F9F9\",\"container_bg\":\"#F7F7F7\",\"title_color\":\"#222222\",\"product_name_color\":\"#333333\",\"button_bg\":\"#333333\",\"button_text_color\":\"#FFFFFF\",\"faq-title\":\"Frequently asked quest\",\"product_price_color\":\"#737373\",\"border_radius\":5,\"border_color\":\"#333333\",\"advance_option\":null,\"faqs\":[{\"q\":\"Who are you?\",\"a\":\"Hello, World!\"},{\"q\":\"Who am I?\",\"a\":\"Hello, Bangladesh!\"},{\"q\":\"Where is my order?\",\"a\":\"Eu dolor ac sagittis interdum ut eleifend at sed. Tempor accumsan in elit, nibh ac mattis turpis odio. Libero egestas id nec magna ipsum morbi. Eu vel placerat ridiculus fermentum duis. Purus ipsum mus augue non nunc, libero feugiat. Pharetra volutpat nibh facilisi auctor aliquet mattis dictum ac congue.\"}]}",
          "active": 1,
          'amount-spent': amountSpent,
          'location': { page: 'customer-info', position: 'Checkout::Actions::RenderBefore' },
          'collections': JSON.stringify(customer?.body?.data?.collections?.nodes),
          'customer-tags': JSON.stringify(customerTags),
          'customer-orders': customerOrders,
          'handles': JSON.stringify(handles),
          "created_at": "2023-06-15 08:22:11",
          "updated_at": "2023-06-16 10:03:42"
        },
        {
          "id": 135,
          "shop_url": "abid-devs-store.myshopify.com",
          "template_id": 3,
          "widget_name": "Widget 2",
          "product_feed_type": "auto",
          "selected_feeds": "[{\"id\":40,\"shop_url\":\"abid-devs-store.myshopify.com\",\"name\":\"Feed 1\",\"description\":\"test\",\"products\":\"[{\\\"cursor\\\":\\\"eyJsYXN0X2lkIjo4MjEwMzY2ODI0NzI0LCJsYXN0X3ZhbHVlIjoiODIxMDM2NjgyNDcyNCJ9\\\",\\\"node\\\":{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/Product\\\/8210366824724\\\",\\\"title\\\":\\\"The Multi-managed Snowboard\\\",\\\"featuredImage\\\":{\\\"url\\\":\\\"https:\\\/\\\/cdn.shopify.com\\\/s\\\/files\\\/1\\\/0743\\\/4141\\\/7236\\\/products\\\/Main_9129b69a-0c7b-4f66-b6cf-c4222f18028a.jpg?v=1680514107\\\"},\\\"priceRangeV2\\\":{\\\"maxVariantPrice\\\":{\\\"currencyCode\\\":\\\"BDT\\\"}},\\\"variants\\\":{\\\"nodes\\\":[{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/ProductVariant\\\/44807032078612\\\",\\\"price\\\":\\\"629.95\\\",\\\"image\\\":null,\\\"title\\\":\\\"Default Title\\\",\\\"displayName\\\":\\\"The Multi-managed Snowboard - Default Title\\\",\\\"taxable\\\":true,\\\"availableForSale\\\":true,\\\"inventoryQuantity\\\":499999586}]}}},{\\\"cursor\\\":\\\"eyJsYXN0X2lkIjo4MjEwMzY2ODU3NDkyLCJsYXN0X3ZhbHVlIjoiODIxMDM2Njg1NzQ5MiJ9\\\",\\\"node\\\":{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/Product\\\/8210366857492\\\",\\\"title\\\":\\\"The Collection Snowboard: Oxygen\\\",\\\"featuredImage\\\":{\\\"url\\\":\\\"https:\\\/\\\/cdn.shopify.com\\\/s\\\/files\\\/1\\\/0743\\\/4141\\\/7236\\\/products\\\/Main_d624f226-0a89-4fe1-b333-0d1548b43c06.jpg?v=1680514108\\\"},\\\"priceRangeV2\\\":{\\\"maxVariantPrice\\\":{\\\"currencyCode\\\":\\\"BDT\\\"}},\\\"variants\\\":{\\\"nodes\\\":[{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/ProductVariant\\\/44807032111380\\\",\\\"price\\\":\\\"1025.00\\\",\\\"image\\\":null,\\\"title\\\":\\\"Default Title\\\",\\\"displayName\\\":\\\"The Collection Snowboard: Oxygen - Default Title\\\",\\\"taxable\\\":true,\\\"availableForSale\\\":true,\\\"inventoryQuantity\\\":499999519}]}}},{\\\"cursor\\\":\\\"eyJsYXN0X2lkIjo4MjEwMzY2OTg4NTY0LCJsYXN0X3ZhbHVlIjoiODIxMDM2Njk4ODU2NCJ9\\\",\\\"node\\\":{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/Product\\\/8210366988564\\\",\\\"title\\\":\\\"The Collection Snowboard: Liquid\\\",\\\"featuredImage\\\":{\\\"url\\\":\\\"https:\\\/\\\/cdn.shopify.com\\\/s\\\/files\\\/1\\\/0743\\\/4141\\\/7236\\\/products\\\/Main_b13ad453-477c-4ed1-9b43-81f3345adfd6.jpg?v=1680514109\\\"},\\\"priceRangeV2\\\":{\\\"maxVariantPrice\\\":{\\\"currencyCode\\\":\\\"BDT\\\"}},\\\"variants\\\":{\\\"nodes\\\":[{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/ProductVariant\\\/44807032340756\\\",\\\"price\\\":\\\"749.95\\\",\\\"image\\\":null,\\\"title\\\":\\\"Default Title\\\",\\\"displayName\\\":\\\"The Collection Snowboard: Liquid - Default Title\\\",\\\"taxable\\\":true,\\\"availableForSale\\\":true,\\\"inventoryQuantity\\\":499999570}]}}},{\\\"cursor\\\":\\\"eyJsYXN0X2lkIjo4MjEwMzY2NjkzNjUyLCJsYXN0X3ZhbHVlIjoiODIxMDM2NjY5MzY1MiJ9\\\",\\\"node\\\":{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/Product\\\/8210366693652\\\",\\\"title\\\":\\\"The Complete Snowboard\\\",\\\"featuredImage\\\":{\\\"url\\\":\\\"https:\\\/\\\/cdn.shopify.com\\\/s\\\/files\\\/1\\\/0743\\\/4141\\\/7236\\\/products\\\/Main_589fc064-24a2-4236-9eaf-13b2bd35d21d.jpg?v=1680514107\\\"},\\\"priceRangeV2\\\":{\\\"maxVariantPrice\\\":{\\\"currencyCode\\\":\\\"BDT\\\"}},\\\"variants\\\":{\\\"nodes\\\":[{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/ProductVariant\\\/44807031947540\\\",\\\"price\\\":\\\"599.95\\\",\\\"image\\\":null,\\\"title\\\":\\\"Electric\\\",\\\"displayName\\\":\\\"The Complete Snowboard - Electric\\\",\\\"taxable\\\":true,\\\"availableForSale\\\":true,\\\"inventoryQuantity\\\":499999569}]}}},{\\\"cursor\\\":\\\"eyJsYXN0X2lkIjo4MjEwMzY2NTYyNTgwLCJsYXN0X3ZhbHVlIjoiODIxMDM2NjU2MjU4MCJ9\\\",\\\"node\\\":{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/Product\\\/8210366562580\\\",\\\"title\\\":\\\"The Collection Snowboard: Hydrogen\\\",\\\"featuredImage\\\":{\\\"url\\\":\\\"https:\\\/\\\/cdn.shopify.com\\\/s\\\/files\\\/1\\\/0743\\\/4141\\\/7236\\\/products\\\/Main.jpg?v=1680514106\\\"},\\\"priceRangeV2\\\":{\\\"maxVariantPrice\\\":{\\\"currencyCode\\\":\\\"BDT\\\"}},\\\"variants\\\":{\\\"nodes\\\":[{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/ProductVariant\\\/44807031554324\\\",\\\"price\\\":\\\"600.00\\\",\\\"image\\\":null,\\\"title\\\":\\\"Default Title\\\",\\\"displayName\\\":\\\"The Collection Snowboard: Hydrogen - Default Title\\\",\\\"taxable\\\":true,\\\"availableForSale\\\":true,\\\"inventoryQuantity\\\":499999596}]}}},{\\\"cursor\\\":\\\"eyJsYXN0X2lkIjo4MjEwMzY2NjYwODg0LCJsYXN0X3ZhbHVlIjoiODIxMDM2NjY2MDg4NCJ9\\\",\\\"node\\\":{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/Product\\\/8210366660884\\\",\\\"title\\\":\\\"The Multi-location Snowboard\\\",\\\"featuredImage\\\":{\\\"url\\\":\\\"https:\\\/\\\/cdn.shopify.com\\\/s\\\/files\\\/1\\\/0743\\\/4141\\\/7236\\\/products\\\/Main_0a4e9096-021a-4c1e-8750-24b233166a12.jpg?v=1680514107\\\"},\\\"priceRangeV2\\\":{\\\"maxVariantPrice\\\":{\\\"currencyCode\\\":\\\"BDT\\\"}},\\\"variants\\\":{\\\"nodes\\\":[{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/ProductVariant\\\/44807031652628\\\",\\\"price\\\":\\\"729.95\\\",\\\"image\\\":null,\\\"title\\\":\\\"Default Title\\\",\\\"displayName\\\":\\\"The Multi-location Snowboard - Default Title\\\",\\\"taxable\\\":true,\\\"availableForSale\\\":true,\\\"inventoryQuantity\\\":499999902}]}}},{\\\"cursor\\\":\\\"eyJsYXN0X2lkIjo4MjEwMzY2NzkxOTU2LCJsYXN0X3ZhbHVlIjoiODIxMDM2Njc5MTk1NiJ9\\\",\\\"node\\\":{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/Product\\\/8210366791956\\\",\\\"title\\\":\\\"The 3p Fulfilled Snowboard\\\",\\\"featuredImage\\\":{\\\"url\\\":\\\"https:\\\/\\\/cdn.shopify.com\\\/s\\\/files\\\/1\\\/0743\\\/4141\\\/7236\\\/products\\\/Main_b9e0da7f-db89-4d41-83f0-7f417b02831d.jpg?v=1680514107\\\"},\\\"priceRangeV2\\\":{\\\"maxVariantPrice\\\":{\\\"currencyCode\\\":\\\"BDT\\\"}},\\\"variants\\\":{\\\"nodes\\\":[{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/ProductVariant\\\/44807032045844\\\",\\\"price\\\":\\\"2629.95\\\",\\\"image\\\":null,\\\"title\\\":\\\"Default Title\\\",\\\"displayName\\\":\\\"The 3p Fulfilled Snowboard - Default Title\\\",\\\"taxable\\\":true,\\\"availableForSale\\\":true,\\\"inventoryQuantity\\\":499998573}]}}}]\",\"active\":0,\"created_at\":\"2023-06-13 09:43:41\",\"updated_at\":\"2023-06-15 08:20:28\"},{\"id\":39,\"shop_url\":\"abid-devs-store.myshopify.com\",\"name\":\"Feed 2\",\"description\":\"askdjl\",\"products\":\"[{\\\"cursor\\\":\\\"eyJsYXN0X2lkIjo4MjEwMzY2NjI4MTE2LCJsYXN0X3ZhbHVlIjoiODIxMDM2NjYyODExNiJ9\\\",\\\"node\\\":{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/Product\\\/8210366628116\\\",\\\"title\\\":\\\"The Archived Snowboard\\\",\\\"featuredImage\\\":{\\\"url\\\":\\\"https:\\\/\\\/cdn.shopify.com\\\/s\\\/files\\\/1\\\/0743\\\/4141\\\/7236\\\/products\\\/Main_52f8e304-92d9-4a36-82af-50df8fe31c69.jpg?v=1680514107\\\"},\\\"priceRangeV2\\\":{\\\"maxVariantPrice\\\":{\\\"currencyCode\\\":\\\"BDT\\\"}},\\\"variants\\\":{\\\"nodes\\\":[{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/ProductVariant\\\/44807031587092\\\",\\\"price\\\":\\\"629.95\\\",\\\"image\\\":null,\\\"title\\\":\\\"Default Title\\\",\\\"displayName\\\":\\\"The Archived Snowboard - Default Title\\\",\\\"taxable\\\":true,\\\"availableForSale\\\":true,\\\"inventoryQuantity\\\":499999947}]}}},{\\\"cursor\\\":\\\"eyJsYXN0X2lkIjo4MjEwMzY2NTYyNTgwLCJsYXN0X3ZhbHVlIjoiODIxMDM2NjU2MjU4MCJ9\\\",\\\"node\\\":{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/Product\\\/8210366562580\\\",\\\"title\\\":\\\"The Collection Snowboard: Hydrogen\\\",\\\"featuredImage\\\":{\\\"url\\\":\\\"https:\\\/\\\/cdn.shopify.com\\\/s\\\/files\\\/1\\\/0743\\\/4141\\\/7236\\\/products\\\/Main.jpg?v=1680514106\\\"},\\\"priceRangeV2\\\":{\\\"maxVariantPrice\\\":{\\\"currencyCode\\\":\\\"BDT\\\"}},\\\"variants\\\":{\\\"nodes\\\":[{\\\"id\\\":\\\"gid:\\\/\\\/shopify\\\/ProductVariant\\\/44807031554324\\\",\\\"price\\\":\\\"600.00\\\",\\\"image\\\":null,\\\"title\\\":\\\"Default Title\\\",\\\"displayName\\\":\\\"The Collection Snowboard: Hydrogen - Default Title\\\",\\\"taxable\\\":true,\\\"availableForSale\\\":true,\\\"inventoryQuantity\\\":499999596}]}}}]\",\"active\":0,\"created_at\":\"2023-06-13 09:43:09\",\"updated_at\":\"2023-06-15 08:20:35\"}]",
          "selected_segments": "{\"included\":[{\"id\":84,\"shop_url\":\"abid-devs-store.myshopify.com\",\"name\":\"Segment 1\",\"conditions\":\"{\\\"condition_0\\\":[{\\\"logic\\\":\\\"product-title\\\",\\\"value\\\":\\\"contains\\\",\\\"price\\\":\\\"hydrogen\\\"},{\\\"logic\\\":\\\"product-specific-quantity\\\",\\\"value\\\":\\\"is-less-than\\\",\\\"price\\\":\\\"5\\\"}]}\",\"active\":1,\"created_at\":\"2023-06-14 04:39:06\",\"updated_at\":\"2023-06-17 06:19:28\"}],\"excluded\":[]}",
          "widget_location": "Checkout Page",
          'widget_position': 'Checkout::CartLines::RenderAfter',
          "widget_customization": "{\"title\":\"You may also like\",\"cta\":\"Add to cart\",\"title_visibility\":1,\"scroll_button_visibility\":1,\"auto_scroll\":0,\"body_bg\":\"#F9F9F9\",\"container_bg\":\"#F7F7F7\",\"title_color\":\"#222222\",\"product_name_color\":\"#333333\",\"button_bg\":\"#333333\",\"button_text_color\":\"#FFFFFF\",\"product_price_color\":\"#737373\",\"border_radius\":5,\"border_color\":\"#333333\",\"advance_option\":null}",
          "active": 1,
          'location': { page: 'customer-info', position: 'Checkout::CartLines::RenderAfter' },
          'amount-spent': amountSpent,
          'collections': JSON.stringify(customer?.body?.data?.collections?.nodes),
          'customer-tags': JSON.stringify(customerTags),
          'customer-orders': customerOrders,
          'handles': JSON.stringify(handles),
          "created_at": "2023-06-15 08:22:11",
          "updated_at": "2023-06-16 10:03:42"
        }],
        "message": "Upsell Widget Found."
      }
    )
  } catch (e) {
    console.log(e)
    res.sendStatus(404)
  }
})

app.listen(9000, () => console.log('Navidium widgets backend running'))
