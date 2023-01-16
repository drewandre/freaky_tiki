def returniOSOutputNameForTargetEnv(target, extra)
  case target
    when 'dev2'
      return 'freakytiki' + extra
    when 'dev'
      return 'freakytiki' + extra
    when 'staging'
      return 'freakytiki' + extra
    when 'prod'
      return 'freakytiki' + extra
    else UI.abort_with_message!('Unknown target supplied to returniOSOutputNameForTargetEnv')
  end
end

def returniOSSchemeForTargetEnv(target)
  case target
    when 'dev2'
      return 'freakytiki_release'
    when 'dev'
      return 'freakytiki_release'
    when 'staging'
      return 'freakytiki_release'
    when 'prod'
      return 'freakytiki_release'
    else UI.abort_with_message!('Unknown target supplied to returniOSSchemeForTargetEnv')
  end
end

def returnTestflightTestingLinkForTarget(target)
  case target
    when 'dev2'
      return 'itms-beta://beta.itunes.apple.com/v1/app/1665500829'
    when 'dev'
      return 'itms-beta://beta.itunes.apple.com/v1/app/1665500829'
    when 'staging'
      return 'itms-beta://beta.itunes.apple.com/v1/app/1665500829'
    when 'prod'
      return 'itms-beta://beta.itunes.apple.com/v1/app/1665500829'
    else UI.abort_with_message!('Unknown target supplied to returnTestflightTestingLinkForTarget')
  end
end
