import { useState } from 'react';
import { InlineLayout, Icon, View, Text, Grid, Button, useApplyDiscountCodeChange } from '@shopify/checkout-ui-extensions-react'

export default function Coupon({ data }) {
  const couponCode = JSON.parse(data?.widgets?.at(0)?.widget_customization)?.title?.coupon
  const [loading, setLoading] = useState(false)
  const applyDiscountCodeChange = useApplyDiscountCodeChange()

  if (!couponCode) return <></>
  else return (
    <InlineLayout border='base' borderWidth='base' borderRadius='base' padding='base'>
      <View>
        <Grid columns={['auto', 'fill', 'fill']} spacing='base' blockAlignment='center'>
          <Icon size='large' appearance='subdued' source='discount' />
          <Text emphasis='bold' appearance='subdued'>{couponCode}</Text>
          <View inlineAlignment='end'>
            <Button
              loading={loading}
              onPress={() => {
                setLoading(true)
                applyDiscountCodeChange({ type: 'addDiscountCode', code: couponCode })
                  .finally(() => setLoading(false))
              }}
            >
              Apply
            </Button>
          </View>
        </Grid>
      </View>
    </InlineLayout>
  )
}
