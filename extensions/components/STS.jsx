import { ChoiceList, BlockLayout, Text, Choice, InlineLayout, TextBlock, Select, InlineSpacer, View } from '@shopify/checkout-ui-extensions-react';

export default function STS() {
  return (
    <>
      <Text>Select Frequency</Text>
      <View padding='extraTight' />
      <ChoiceList
        name="choice"
        value="first"
        onChange={(value) => {
          console.log(`onChange event with value: ${value}`);
        }}
      >
        <BlockLayout border='base' padding='base' borderRadius='base'>
          <Choice id="first">
            <InlineLayout>
              <TextBlock appearance="info">Subscribe & Save</TextBlock>
              <TextBlock inlineAlignment="end">$80.98</TextBlock>
            </InlineLayout>

            <InlineLayout>
              <TextBlock appearance="subdued" size="small">Lock in <Text appearance="info">20% off</Text> and never run out</TextBlock>
              <TextBlock inlineAlignment="end" appearance="subdued"><Text size="small" accessibilityRole='deletion'>$84.98</Text></TextBlock>
            </InlineLayout>

            <Select
              label="Deliver every"
              value="2"
              options={[
                {
                  value: '1',
                  label: 'Every Day',
                },
                {
                  value: '2',
                  label: '2 Day',
                },
                {
                  value: '3',
                  label: '3 Day',
                },
                {
                  value: '4',
                  label: '4 Day',
                },
                {
                  value: '5',
                  label: '5 Day',
                },
                {
                  value: '6',
                  label: '6 Day',
                },
                {
                  value: '7',
                  label: 'Every Week',
                },
                {
                  value: '8',
                  label: '2 Week',
                },
                {
                  value: '9',
                  label: '3 Week',
                },
                {
                  value: '8',
                  label: '4 Week',
                },
                {
                  value: '9',
                  label: 'Every Month',
                },
                {
                  value: '10',
                  label: '2 Month',
                },
                {
                  value: '11',
                  label: '3 Month',
                },
                {
                  value: '12',
                  label: '4 Month',
                },
                {
                  value: '13',
                  label: '5 Month',
                },
                {
                  value: '14',
                  label: '6 Month',
                },
                {
                  value: '15',
                  label: '7 Month',
                },
                {
                  value: '16',
                  label: '8 Month',
                },
                {
                  value: '16',
                  label: '9 Month',
                },
                {
                  value: '17',
                  label: '10 Month',
                },
                {
                  value: '18',
                  label: '11 Month',
                },
                {
                  value: '19',
                  label: '12 Month',
                },
              ]}
            />
            <Text appearance="subdued">Skip, modify or cancel anytime.</Text>
          </Choice>
        </BlockLayout>
        <View padding='extraTight' />
        <BlockLayout border='base' padding='base' borderRadius='base'>
          <Choice id="second">
            <InlineLayout>
              <TextBlock>One-Time Purchase</TextBlock>
              <InlineSpacer />
              <TextBlock inlineAlignment="end" appearance="subdued">$84.98</TextBlock>
            </InlineLayout>
          </Choice>
        </BlockLayout>
      </ChoiceList>
    </>
  )
}
