import { useExtensionApi, BlockStack, Grid, InlineStack, Image, Text } from '@shopify/checkout-ui-extensions-react';
import { avatar, quoteIcon } from './icons.js';

export default function Quote({ data }) {
  const { extensionPoint } = useExtensionApi()
  const widgetData = JSON.parse(data?.widgets?.find(widget => widget.widget_position === extensionPoint)?.widget_customization)

  return (
    <>
      <BlockStack border='base' borderRadius='base' borderWidth='base' padding='base'>
        <Text size='base'>{widgetData?.title?.quote}</Text>
        <Grid columns={['10%', 'fill', '30%']} spacing='base' blockAlignment='center'>
          <Image source={widgetData?.user?.image || avatar} borderRadius='base' />
          <Text>{widgetData?.user?.name || 'Anonymous'}</Text>
          <InlineStack inlineAlignment='end'>
            <Image source={quoteIcon} />
          </InlineStack>
        </Grid>
      </BlockStack>
    </>
  )
}
