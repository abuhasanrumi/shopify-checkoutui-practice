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
import { useState } from 'react'
import { useEffect } from 'react'
import { Loading } from '@shopify/app-bridge-react'

render('Checkout::Dynamic::Render', () => <App />)

function App() {
  const { query, extensionPoint } = useExtensionApi()
  const translate = useTranslate()
  const applyCartLinesChange = useApplyCartLinesChange()
  const cartLines = useCartLines()

  function removeItemFromCartLines(variantId) {
    console.log('cartLines', cartLines)
    let itemId = ''
    cartLines.forEach((item) => {
      if (item.merchandise.id == variantId) {
        itemId = item.id
      }
    })

    return itemId
  }

  console.log(
    'return',
    removeItemFromCartLines('gid://shopify/ProductVariant/44807031652628')
  )

  const [addLoading, setAddLoading] = useState(false)
  const [removeLoading, setRemoveLoading] = useState(false)
  const [products, setProducts] = useState('')

  // useEffect(() => {
  //   // Set the loading state to show some UI if you're waiting
  //   setLoading(true)
  //   // Use `query` api method to send graphql queries to the Storefront API
  //   query(
  //     `query ($first: Int!) {
  //       products(first: $first) {
  //         nodes {
  //           id
  //           title
  //           images(first:1){
  //             nodes {
  //               url
  //             }
  //           }
  //           variants(first: 1) {
  //             nodes {
  //               id
  //               price {
  //                 amount
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }`,
  //     {
  //       variables: { first: 5 }
  //     }
  //   )
  //     .then(({ data }) => {
  //       // console.log(data)
  //     })
  //     .catch((error) => console.error(error))
  //     .finally(() => setLoading(false))
  // }, [])

  return (
    <Grid
      border='base'
      padding='base'
      columns={['40%', 'fill']}
      rows={[300, 'auto']}
      spacing='loose'>
      <View>
        <Image source='https://static.vecteezy.com/system/resources/previews/003/394/636/non_2x/flowerpot-with-ground-illustration-free-vector.jpg' />
      </View>
      <View>
        <Heading>I am a Pot</Heading>
        <BlockSpacer spacing='loose' />
        <Text size='base'>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Obcaecati
          placeat possimus voluptatum placeat maxime voluptas facilis.
        </Text>
        <BlockSpacer spacing='loose' />
        <Select
          label='Country'
          value='2'
          options={[
            {
              value: '1',
              label: 'Australia'
            },
            {
              value: '2',
              label: 'Canada'
            },
            {
              value: '3',
              label: 'France'
            },
            {
              value: '4',
              label: 'Japan'
            },
            {
              value: '5',
              label: 'Nigeria'
            },
            {
              value: '6',
              label: 'United States'
            }
          ]}
        />
        <BlockSpacer spacing='loose' />
        <Button
          loading={addLoading}
          onPress={async () => {
            try {
              setAddLoading(true)

              await applyCartLinesChange({
                type: 'addCartLine',
                merchandiseId: 'gid://shopify/ProductVariant/44807031652628',
                quantity: 1
              })
            } finally {
              setAddLoading(false)
            }
          }}>
          Buy now
        </Button>
        <Button
          appearance='critical'
          loading={removeLoading}
          onPress={async () => {
            try {
              setRemoveLoading(true)

              await applyCartLinesChange({
                type: 'removeCartLine',
                id: removeItemFromCartLines(
                  'gid://shopify/ProductVariant/44807031652628'
                ),
                quantity: 1
              })
            } finally {
              setRemoveLoading(false)
            }
          }}>
          Remove
        </Button>
      </View>
    </Grid>
  )
}
