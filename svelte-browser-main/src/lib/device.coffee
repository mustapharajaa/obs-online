
threshold_to_s = (newVal, margin, keep, lo, l1, l2, l3)->
  switch
    when newVal < -margin
      l1
    when margin < newVal
      l3
    when lo == l1 && newVal < -keep
      l1
    when lo == l3 && keep < newVal
      l3
    else
      l2

xyz = (newVal, oldVal)->
  { x, y, z } = newVal
  { margin, keep } = m
  margin *= 10
  keep   *= 10
  oldVal.label_x = lx = threshold_to_s x, margin, keep, oldVal.label_x, "右", "", "左"
  oldVal.label_y = ly = threshold_to_s y, margin, keep, oldVal.label_y, "上", "", "下"
  oldVal.label_z = lz = threshold_to_s z, margin, keep, oldVal.label_z, "表", "", "裏"
  oldVal.label = """#{lx}#{ly}#{lz}"""

  oldVal.x = x
  oldVal.y = y
  oldVal.z = z

abg = (newVal, oldVal)->
  { alpha, beta, gamma } = newVal
  { margin, keep } = m
  margin *= 360
  keep   *= 360
  oldVal.label_alpha = la = threshold_to_s alpha, margin, keep, oldVal.label_alpha, "押下", "", "引上"
  oldVal.label_beta  = lb = threshold_to_s beta,  margin, keep, oldVal.label_beta,  "左巻", "", "右巻"
  oldVal.label_gamma = lg = threshold_to_s gamma, margin, keep, oldVal.label_gamma, "右折", "", "左折"
  oldVal.label = """#{la}#{lb}#{lg}"""

  oldVal.alpha = alpha
  oldVal.beta  = beta
  oldVal.gamma = gamma

gamepads = []


scroll =
  top:    0
  center: 0
  bottom: 0

  left:   0
  right:  0

  horizon: 0
  height:  0
  width:   0

  size:         0
  aspect_ratio: 1
  is_square:     true
  is_oblong:    false
  is_horizontal: true
  is_vertical:  false



gamepad_poll =
  count: 0
  conn: ({ gamepad: { timestamp, connected, buttons, axes } })->
    { index, timestamp, connected, buttons, axes } = gamepad
    gamepads[index] = gamepad
    if connected
      # join
    else
      # bye
  call: ->
    unless window.ongamepadconnected
      for gamepad in navigator.getGamepads()
        { index } = gamepad
        gamepads[index] = gamepad
      
    requestAnimationFrame gamepad_poll.call

  with: (o)->
    Object.assign o,
      mounted: =>
        return unless window?
        return if @count++
        @call()
        if window.ongamepadconnected
          window.addEventListener "gamepadconnected", @conn
          window.addEventListener "gamepaddisconnected", @conn

      beforeDestroy: =>
        return if --@count
        if window.ongamepadconnected
          window.removeEventListener "gamepadconnected", @conn
          window.removeEventListener "gamepaddisconnected", @conn


module.exports = m =
  margin: 0.4
  keep:   0.1
  device: ({ margin, keep })->
    m.margin = margin
    m.keep   = keep

   gamepad: ->
    gamepad_poll.with
      data: ->
        { gamepads }

  scroll: ->
    scroll_poll.with
      data: ->
        { scroll }

      methods:
        scroll_to: ({ query, mode })->
          return unless el = document?.querySelector query
          return unless { height, top } = el.getBoundingClientRect()
          switch mode
            when 'center'
              top += (height >> 1) - scroll.horizon
            when 'bottom'
              top +=  height

          console.log " go to #{query}(#{mode}) as #{top}px"
          window.scrollBy 0, top


