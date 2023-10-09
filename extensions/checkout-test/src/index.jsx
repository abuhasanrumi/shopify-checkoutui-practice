import React from 'react'
import {
  useExtensionApi,
  render,
  Grid,
  Image,
  Heading,
  View,
  Button,
  BlockSpacer,
  Select,
  useCartLines,
  Banner,
  Text,
  useTranslate,
  useApplyCartLinesChange
} from '@shopify/checkout-ui-extensions-react'
import { useState, useEffect } from 'react'

render('Checkout::Dynamic::Render', () => <App />)

function App() {
  const { query, extensionPoint } = useExtensionApi()
  const translate = useTranslate()
  const applyCartLinesChange = useApplyCartLinesChange()
  const cartLines = useCartLines()

  function getCartLineItemId(variantId) {
    let itemId = ''
    cartLines.forEach((item) => {
      if (item.merchandise.id === variantId) {
        itemId = item.id
      }
    })

    return itemId
  }

  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [selectedVariants, setSelectedVariants] = useState({})

  // Maintain loading states for each product separately
  const [productLoadingStates, setProductLoadingStates] = useState({})

  useEffect(() => {
    setLoading(true)
    query(
      `query ($first: Int!) {
        products(first: $first) {
          nodes {
            id
            title
            images(first:1){
              nodes {
                url
              }
            }
            variants(first: 10) {
              nodes {
                id
                price {
                  amount
                }
              }
            }
          }
        }
      }`,
      {
        variables: { first: 5 }
      }
    )
      .then(({ data }) => {
        setProducts(data.products.nodes)
        const initialSelectedVariants = {}
        data.products.nodes.forEach((product) => {
          initialSelectedVariants[product.id] = product.variants.nodes[0].id
        })
        setSelectedVariants(initialSelectedVariants)
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false))
  }, [])

  // Function to set loading state for a specific product
  function setProductLoading(productId, isLoading) {
    setProductLoadingStates((prevState) => ({
      ...prevState,
      [productId]: isLoading
    }))
  }

  return (
    <>
      {products.length > 0 &&
        products.map((product) => (
          <View key={product.id}>
            <Grid
              border='base'
              padding='base'
              columns={['40%', 'fill']}
              rows={['auto']}
              spacing='loose'>
              <View>
                <Image source={product.images.nodes[0].url} />
              </View>
              <View>
                <Heading>{product.title}</Heading>
                <BlockSpacer spacing='loose' />
                <Select
                  label='Variants'
                  value={selectedVariants[product.id]}
                  onChange={(e) => {
                    setSelectedVariants((prevSelectedVariants) => ({
                      ...prevSelectedVariants,
                      [product.id]: e
                    }))
                  }}
                  options={product.variants.nodes.map(
                    (variant, variantIndex) => ({
                      value: variant.id,
                      label: `Variant ${variantIndex + 1} - $${
                        variant.price.amount
                      }`
                    })
                  )}
                />

                <BlockSpacer spacing='loose' />
                <Button
                  loading={productLoadingStates[product.id] || false}
                  onPress={async () => {
                    try {
                      setProductLoading(product.id, true)

                      await applyCartLinesChange({
                        type: 'addCartLine',
                        merchandiseId: selectedVariants[product.id],
                        quantity: 1
                      })
                    } finally {
                      setProductLoading(product.id, false)
                    }
                  }}>
                  Buy now
                </Button>
                <Button
                  appearance='critical'
                  loading={productLoadingStates[product.id] || false}
                  onPress={async () => {
                    try {
                      setProductLoading(product.id, true)

                      await applyCartLinesChange({
                        type: 'removeCartLine',
                        id: getCartLineItemId(selectedVariants[product.id]),
                        quantity: 1
                      })
                    } finally {
                      setProductLoading(product.id, false)
                    }
                  }}>
                  Remove
                </Button>
              </View>
            </Grid>
          </View>
        ))}
    </>
  )
}
