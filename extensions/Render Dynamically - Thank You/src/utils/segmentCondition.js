export default function segmentCondition(setDisplay, data, { lines, presentmentLines, extensionPoint, includedTrue }) {
  // data?.widgets?.find(widget => widget?.widget_position === extensionPoint)?.selected_segments && JSON.parse(data?.widgets?.find(widget => widget?.widget_position === extensionPoint)?.selected_segments)?.included?.forEach(i => console.log(i.exit_if_matched))
  // do not proceed further if the widget is not active
  if (!(data?.widgets?.find(widget => widget?.widget_position === extensionPoint)?.active)) return setDisplay(false)
  // do not proceed further if the widget location is not checkout page
  // if (!(data?.widgets?.find(widget => widget?.widget_position === extensionPoint)?.widget_location === 'Checkout Page')) return setDisplay(false)

  const condition = data?.widgets?.find(widget => widget?.widget_position === extensionPoint)?.selected_segments
  if (!condition) return setDisplay(false)
  const inExObj = {}
  let includedArray = []
  let excludedArray = []

  Object
    .keys(condition)
    .forEach(i => i === 'included' ? includedArray = (condition[i]) : excludedArray = (condition[i]))

  // Object.keys(condition).forEach(i => conditions.push(condition[i]))
  // const displayArray = Array.from({ length: conditions.length })
  // const displayArray = []
  function arrayForEach(i, index) {
    if (exitIfMatched) return
    const segments = []
    Object.keys(JSON.parse(i.conditions)).forEach(j => segments.push(JSON.parse(i.conditions)[j]))
    const segmentsDisplay = []
    segments.forEach(j => {
      const display = []
      j.forEach((k, kIndex) => {
        switch (k.logic) {
          case 'product-title':
            const titles = []
            const titlesBool = []

            lines.forEach(title => titles.push(title.merchandise.title))

            const titleRegexp = new RegExp(k.price, 'gi')

            if (k.value === 'contains') {
              titles.forEach(title => !title.toLowerCase().match(titleRegexp) ? titlesBool.push(false) : titlesBool.push(true))
            }
            else if (k.value === 'does-not-contains') {
              titles.forEach(title => !title.toLowerCase().match(titleRegexp) ? titlesBool.push(true) : titlesBool.push(false))
            }

            titlesBool.includes(true) ? display.push(true) : display.push(false)
            break

          case 'product-vendor':
            if (k.value === 'contains') {
              const vendors = []
              lines.forEach(i => vendors.push(i.merchandise.product.vendor))
              const vendorRegexp = new RegExp(k.price, 'gi')
              vendors.forEach(i => !i.toLowerCase().match(vendorRegexp) ? display.push(false) : display.push(true))
            } else if (k.value === 'does-not-contains') {
              const vendors = []
              lines.forEach(i => vendors.push(i.merchandise.product.vendor))
              const vendorRegexp = new RegExp(k.price, 'gi')
              vendors.forEach(i => !i.toLowerCase().match(vendorRegexp) ? display.push(true) : display.push(false))
            }
            break

          case 'product-type':
            const types = []
            lines.forEach(i => types.push(i.merchandise.product.productType))
            const typeRegexp = new RegExp(k.price, 'gi')
            if (k.value === 'contains') {
              types.forEach(i => !i.toLowerCase().match(typeRegexp) ? display.push(false) : display.push(true))
            } else if (k.value === 'does-not-contains') {
              types.forEach(i => !i.toLowerCase().match(typeRegexp) ? display.push(true) : display.push(false))
            }
            break

          case 'product-specific-quantity':
            const specificQuantity = lines?.find(line => line?.merchandise?.title?.match(new RegExp(j[kIndex - 1]?.price, 'gi')))?.quantity

            if (k.value === 'is-less-than') {
              Number(k.price) > specificQuantity ? display.push(true) : display.push(false)
            } else if (k.value === 'is-greater-than') {
              Number(k.price) < specificQuantity ? display.push(true) : display.push(false)
            } else {
              Number(k.price) === specificQuantity ? display.push(true) : display.push(false)
            }
            break

          case 'cart-subtotal':
            let subtotalQuantity = 0
            presentmentLines.current.forEach(presentmentLine => subtotalQuantity += presentmentLine.cost.totalAmount.amount)

            if (k.value === 'is-less-than') {
              Number(k.price) > subtotalQuantity ? display.push(true) : display.push(false)
            } else if (k.value === 'is-greater-than') {
              Number(k.price) < subtotalQuantity ? display.push(true) : display.push(false)
            } else {
              Number(k.price) === subtotalQuantity ? display.push(true) : display.push(false)
            }
            break

          case 'cart-line-count':
            if (k.value === 'is-less-than') {
              Number(k.price) > lines.length ? display.push(true) : display.push(false)
            } else if (k.value === 'is-greater-than') {
              Number(k.price) < lines.length ? display.push(true) : display.push(false)
            } else {
              Number(k.price) === lines.length ? display.push(true) : display.push(false)
            }
            break

          case 'cart-item-count':
            let itemCount = 0
            lines.forEach(line => itemCount += line.quantity)

            if (k.value === 'is-less-than') {
              Number(k.price) > itemCount ? display.push(true) : display.push(false)
            } else if (k.value === 'is-greater-than') {
              Number(k.price) < itemCount ? display.push(true) : display.push(false)
            } else {
              Number(k.price) === itemCount ? display.push(true) : display.push(false)
            }
            break

          case 'product-price':
            const prices = []
            lines?.forEach(line => prices.push(line.cost.totalAmount.amount))

            const isTrue = []

            if (k.value === 'is-less-than') {
              prices.forEach(price => {
                if (Number(k.price) > price) isTrue.push(true)
                else isTrue.push(false)
              })
              // Number(k.price) > cost.totalAmount.current.amount ? display.push(true) : display.push(false)
            } else if (k.value === 'is-greater-than') {
              prices.forEach(price => {
                if (Number(k.price) < price) isTrue.push(true)
                else isTrue.push(false)
              })
              // Number(k.price) < cost.totalAmount.current.amount ? display.push(true) : display.push(false)
            } else {
              prices.forEach(price => {
                if (Number(k.price) === price) isTrue.push(true)
                else isTrue.push(false)
              })
              // Number(k.price) === cost.totalAmount.current.amount ? display.push(true) : display.push(false)
            }
            isTrue.includes(true) ? display.push(true) : display.push(false)
            break

          case 'customer-total-spent':
            const total = Number(data?.widgets?.[0]?.['amount-spent'])
            if (k.value === 'is-less-than') {
              Number(k.price) > total ? display.push(true) : display.push(false)
            } else if (k.value === 'is-greater-than') {
              Number(k.price) < total ? display.push(true) : display.push(false)
            } else {
              Number(k.price) === total ? display.push(true) : display.push(false)
            }
            break

          case 'customer-orders-count':
            const totalOrders = Number(data?.widgets?.[0]?.['customer-orders'])
            if (k.value === 'is-less-than') {
              Number(k.price) > totalOrders ? display.push(true) : display.push(false)
            } else if (k.value === 'is-greater-than') {
              Number(k.price) < totalOrders ? display.push(true) : display.push(false)
            } else {
              Number(k.price) === totalOrders ? display.push(true) : display.push(false)
            }
            break

          case 'collection':
            const collections = JSON.parse(data?.widgets?.at(0)?.collections)

            if (k.value === 'contains') {
              const titleRegexp = new RegExp(k.price, 'gi')
              const collection = collections.find(collection => collection.title.match(titleRegexp))
              collection ? display.push(true) : display.push(false)
            } else {
              const titleRegexp = new RegExp(k.price, 'gi')
              const collection = collections.find(collection => collection.title.match(titleRegexp))
              collection ? display.push(false) : display.push(true)
            }
            break

          case 'product-handle':
            const handles = JSON.parse(data?.widgets?.at(0)?.handles)

            if (k.value === 'contains') {
              const titleRegexp = new RegExp(k.price, 'gi')
              const handle = handles.find(handle => handle.handle.match(titleRegexp))
              handle ? display.push(true) : display.push(false)
            } else {
              const titleRegexp = new RegExp(k.price, 'gi')
              const handle = handles.find(handle => handle.handle.match(titleRegexp))
              handle ? display.push(false) : display.push(true)
            }
            break

          case 'customer-tags':
            const tags = JSON.parse(data?.widgets?.at(0)?.['customer-tags'])

            if (k.value === 'contains') {
              const titleRegexp = new RegExp(k.price, 'gi')
              const tag = tags?.find(tag => tag.match(titleRegexp))
              tag ? display.push(true) : display.push(false)
            } else {
              const titleRegexp = new RegExp(k.price, 'gi')
              const tag = tags?.find(tag => tag.match(titleRegexp))
              tag ? display.push(false) : display.push(true)
            }
            break

          default:
            break
        }
      })
      display.includes(false) ?
        segmentsDisplay.push(false)
        : segmentsDisplay.push(true)
    });
    if (runningIncluded) {
      if (segmentsDisplay.includes(true)) {
        includedDisplay.push(true)
        includedTrue.current.push({ id: i.id, position: extensionPoint })
      } else {
        includedDisplay.push(false)
      }
    } else {
      segmentsDisplay.includes(true) ?
        excludedDisplay.push(true)
        : excludedDisplay.push(false)
    }
    if (i.exit_if_matched && includedDisplay.includes(true)) exitIfMatched = true
    // display.includes(false) ?
    //   displayArray.splice(index, 1, false)
    //   :
    //   displayArray.splice(index, 1, true)
  }

  const includedDisplay = []
  const excludedDisplay = []

  let runningIncluded = true
  let exitIfMatched = false
  includedArray.forEach(arrayForEach)
  includedDisplay.includes(true) ? inExObj.include = true : inExObj.include = false

  runningIncluded = false
  exitIfMatched = false
  excludedArray.forEach(arrayForEach)
  excludedDisplay.includes(true) ? inExObj.exclude = true : inExObj.exclude = false

  if (inExObj.exclude) {
    setDisplay(false)
  } else {
    if (inExObj.include) setDisplay(true)
    else setDisplay(false)
  }
  // inExObj.include === true && setDisplay(true)
  // displayArray.find(i => i === true) && setDisplay(true)
  // console.log(lines.current.at(0).merchandise.title)
}
