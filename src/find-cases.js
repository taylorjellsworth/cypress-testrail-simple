const fs = require('fs')
const { getTestNames, filterByEffectiveTags } = require('find-test-names')

/**
 * Finds the test case IDs in the test titles.
 * @example "C101: Test case title" => "101"
 */
function findCasesInSpec(spec, readSpec = fs.readFileSync, tagged) {
  const source = readSpec(spec, 'utf8')

  let testNames
  if (Array.isArray(tagged) && tagged.length > 0) {
    const filteredTests = filterByEffectiveTags(source, tagged)
    testNames = filteredTests.map((t) => t.name)
  } else {
    const found = getTestNames(source)
    testNames = found.testNames
  }

  // handles both a a single test case ID and multiple test case IDs per test title
  const ids = testNames
    .map((testName) => {
      const matches = testName.match(/\bC(?<caseId>\d+)\:?\b/g)
      if (!matches) {
        return
      }
      let idArray = []
      for (const id of matches) {
        // Slice to remove the leading C in the test case ID
        idArray.push(Number(id.slice(1)))
      }
      return idArray
    })
    .flat().filter((id) => !isNaN(id))

  // make sure the test ids are unique
  return Array.from(new Set(ids)).sort()
}

function findCases(specs, readSpec = fs.readFileSync, tagged) {
  // find case Ids in each spec and flatten into a single array
  const allCaseIds = specs
    .map((spec) => findCasesInSpec(spec, readSpec, tagged))
    .reduce((a, b) => a.concat(b), [])
    .filter((id) => !isNaN(id))
  const uniqueCaseIds = Array.from(new Set(allCaseIds)).sort()
  return uniqueCaseIds
}

module.exports = { findCases, findCasesInSpec }
