import { BlockLayout, Text, InlineLayout, View, Button } from '@shopify/checkout-ui-extensions-react';

export default function BNPLPayment({ data }) {
  console.log(data?.widgets?.at(0))
  const widgetData = JSON.parse(data?.widgets?.at(0)?.widget_customization)?.bnplPayment

  return (
    <>
      <BlockLayout border='base' borderWidth='base' borderRadius='base' padding='base'>
        <View>
          <View inlineAlignment='center'>
            <Text>{JSON.parse(data?.widgets?.at(0)?.widget_customization)?.title?.bnplPayment}</Text>
          </View>
          <View padding='extraTight' />
          <InlineLayout spacing='base'>
            <Button to={widgetData?.leftURL}>{widgetData?.leftText}</Button>
            <Button to={widgetData?.rightURL} kind='secondary'>{widgetData?.rightText}</Button>
          </InlineLayout>
        </View>
      </BlockLayout>
    </>
  )
}
