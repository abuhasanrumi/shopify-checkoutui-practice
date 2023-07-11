import { useState } from 'react';
import { InlineLayout, Icon, View, Text, Grid, Button, useApplyDiscountCodeChange } from '@shopify/checkout-ui-extensions-react'

export default function Coupon() {
  const [loading, setLoading] = useState(false)
  const applyDiscountCodeChange = useApplyDiscountCodeChange()

  return (
    <InlineLayout border='base' borderWidth='base' borderRadius='base' padding='base'>
      <View>
        <Grid columns={['auto', 'fill', 'fill']} spacing='base' blockAlignment='center'>
          <Icon size='large' appearance='subdued' source='discount' />
          <Text emphasis='bold' appearance='subdued'>WINTERSALE</Text>
          <View inlineAlignment='end'>
            <Button
              loading={loading}
              onPress={() => {
                setLoading(true)
                applyDiscountCodeChange({ type: 'addDiscountCode', code: 'WINTERSALE' })
                  .finally(() => setLoading(false))
              }}
            >Apply</Button>
          </View>
        </Grid>
      </View>
    </InlineLayout>
  )
}
