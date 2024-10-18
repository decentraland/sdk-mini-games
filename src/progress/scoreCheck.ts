import { CustomDataKeys, IChallengeData, IScore, ScoreKeys, ValidCondition } from './types'

export function isScoreMetCondition(scoreData: IScore, challengeData: IChallengeData) {
  console.log('score:', scoreData, 'challenge data:', challengeData)

  if (challengeData === null) {
    return false
  }

  let result = false
  for (const key in challengeData) {
    result = false
    console.log(key, key in scoreData, scoreData[key as ScoreKeys], typeof scoreData[key as ScoreKeys])
    switch (key) {
      case 'score':
      case 'level':
      case 'moves':
      case 'time': {
        const value = scoreData[key]
        if (key in scoreData && value !== undefined && value !== null && typeof value === 'number') {
          result = checkCondition(challengeData[key].condition, value, challengeData[key].target)
          console.log('check condition result:', result)
        } else {
          console.log('can not find key:', key)
        }
        break
      }
      case 'data': {
        if (key in scoreData && scoreData[key] !== undefined && scoreData[key] !== null) {
          const customKey = challengeData[key].customDataType as CustomDataKeys
          const value = scoreData[key]
          if (customKey && scoreData.data && customKey in scoreData.data && value && value[customKey]) {
            result = checkCondition(challengeData[key].condition, value[customKey] as any, challengeData[key].target)
            console.log('check condition result:', result)
          } else {
            console.log('can not find key:', customKey)
          }
        } else {
          console.log('can not find key:', key)
        }
        break
      }
      default:
        console.log('no score type key match', key)
        break
    }
    if (!result) return false
  }
  return true
}

function checkCondition(condition: ValidCondition, currentVal: number, targetVal: number) {
  console.log('check condition:', condition, 'current val:', currentVal, 'target val:', targetVal)
  switch (condition) {
    case '=':
      if (currentVal === targetVal) return true
      break

    case '<':
      if (currentVal < targetVal) return true
      break

    case '>':
      if (currentVal > targetVal) return true
      break

    case '<=':
      if (currentVal <= targetVal) return true
      break

    case '>=':
      if (currentVal >= targetVal) return true
      break
  }
  return false
}
