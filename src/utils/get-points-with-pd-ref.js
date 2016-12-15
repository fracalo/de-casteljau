
// getPoints:: pathData -> [Point]
const getPointsWithRef = pd =>
  pd.reduce((ac, x, ii) => {
    let i = 0
    while (i + 2 <= x.values.length) {
      ac.push({
        pos: x.values.slice(i, i + 2),
        ref: x,
        // storing a reference an modifiying that,
        // this is  more performant than reconstructing the pathdata
        // but more contrieved
        out: ii,
        in: i
      })
      i = i + 2
    }
    return ac
  }, [])

export default getPointsWithRef
