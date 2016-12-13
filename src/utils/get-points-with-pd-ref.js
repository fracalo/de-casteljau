import Point from './Point'

// getPoints:: pathData -> [Point]
const getPointsWithRef = pd =>
  pd.reduce((ac, x, ii) => {
    let i = 0
    while (i + 2 <= x.values.length) {
      const [a, b] = x.values.slice(i, i + 2)
      const p = new Point(a, b)
      p.pathdataLoc = {
        ref: x,
        // storing a reference an modifiying that is error prone , but certainly more performant than reconstructing the pathdata
        out: ii,
        in: i
      }
      ac.push(p)
      i = i + 2
    }
    return ac
  }, [])

export default getPointsWithRef
