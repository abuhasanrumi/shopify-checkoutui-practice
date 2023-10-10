import React from 'react'
import {
  Grid,
  BlockSpacer,
  SkeletonImage,
  SkeletonText,
  View
} from '@shopify/checkout-ui-extensions-react'

export default function ProductSkeleton() {
  return (
    <Grid
      columns={['20%', 'fill', 'auto']}
      rows={['auto']}
      blockAlignment='center'
      spacing='base'>
      <View>
        <SkeletonImage inlineSize={100} blockSize={100} />
      </View>
      <View>
        <SkeletonImage inlineSize={150} blockSize={20} />
        <BlockSpacer spacing='base' />
        <SkeletonText />
      </View>
      <View>
        <SkeletonImage inlineSize={100} blockSize={35} />
      </View>
    </Grid>
  )
}
