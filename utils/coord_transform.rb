require 'matrix'

rank = 3
input = "358,229"

def asArray(str)
  coords = []
  str.split(',').each_slice(2) do |x,y|
    coords << [x.to_i, y.to_i]
  end
  coords
end

def asStr(coords)
  xs = []
  ys = []

  coords.each do |coord|
    xs << coord[0]
    ys << coord[1]
  end
  xs.zip(ys).flatten.map{|a| a.round}.join(",")
end

def rotate(pos, degrees)
  m = Matrix[
    [Math.cos(degrees), -Math.sin(degrees) ],
    [Math.sin(degrees),  Math.cos(degrees) ]
  ]
  (m * pos)
end

rotate_by = (2*Math::PI)/12

coords = asArray(input)

translate = Matrix.column_vector([302, 302])

12.times do |i|
  transformed_coords = coords.map do |pos|
    m = Matrix.column_vector pos
    translated = m - translate
    rotated = rotate(translated, rotate_by * (i))
    back_translated = rotated + translate
    back_translated.to_a
  end
#  puts "<area class=\"space\" id=\"space#{rank}-#{(i)}\" shape=\"poly\" coords=\"#{asStr(transformed_coords)}\" alt=\"space#{rank}-#{i}\" />"
#  puts "<div id=\"marker#{rank}-#{(i)}\" style=\"top: px; left: px; position: absolute; width: 20px; height: 20px; border: 2px solid red;#{asStr(transformed_coords)}\" />"
  puts "#marker#{rank}-#{i} {\n  left: #{transformed_coords[0][0][0].round}px;\n  top: #{transformed_coords[0][1][0].round}px;\n}\n";

end
