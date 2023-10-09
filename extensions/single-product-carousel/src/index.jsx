import React from 'react'
import {
  useExtensionApi,
  render,
  BlockLayout,
  BlockStack,
  InlineLayout,
  InlineSpacer,
  Button,
  Image,
  BlockSpacer,
  Text,
  Heading,
  Grid,
  View
} from '@shopify/checkout-ui-extensions-react'

render('Checkout::Dynamic::Render', () => <App />)

function App() {
  const { extensionPoint } = useExtensionApi()
  return (
    <BlockLayout
      rows={[20, 'fill']}
      border='base'
      cornerRadius='base'
      padding='base'
      spacing='large500'
      borderRadius='10px'>
      <View>
        <Text size={'extraLarge'}>YOU MAY ALSO LIKE</Text>
      </View>
      <Grid
        columns={['30%', 'fill', 'auto']}
        rows={['auto']}
        blockAlignment='center'
        spacing='base'>
        <View>
          <Image
            cornerRadius='base'
            source='https://navidiumapp.net/dynamatic-v2/public/build/assets/shoe_1-84c0649c.png'
          />
        </View>
        <View>
          <Heading size={'large'} spacing='loose'>
            Living room sofa
          </Heading>
          <BlockSpacer spacing='base' />
          <Text size={'medium'}>$80.00</Text>
        </View>

        <View>
          <Button
            onPress={() => {
              console.log('onPress event')
            }}>
            + Add
          </Button>
        </View>
      </Grid>
    </BlockLayout>
  )
}
