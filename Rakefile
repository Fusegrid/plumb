require "tempfile"

task :build_javascripts => ["www/javascripts/prototype.js", "www/javascripts/letters.js", "www/javascripts/plumb.js"]

task :copy_javascripts do
  mkdir_p "www/javascripts"
  
  cp "vendor/prototype.js", "www/javascripts/prototype.js"
  
  cp "lib/letters.js", "www/javascripts/letters.js"
  
  src = ""
  
  FileList["lib/plumb.js", "lib/plumb/*.js"].each do |path|
    src += File.read(path) + "\n\n"
  end
  
  tmp = Tempfile.new("plumb")
  tmp << src
  tmp.close
  
  cp tmp.path, "www/javascripts/plumb.js"
end

task "www/javascripts/prototype.js" do
  mkdir_p "www/javascripts"
  `java -jar vendor/shrinksafe.jar vendor/prototype.js > www/javascripts/prototype.js`
end

task "www/javascripts/letters.js" do
  mkdir_p "www/javascripts"
  cp "lib/letters.js", "www/javascripts/letters.js"
end

task "www/javascripts/plumb.js" do
  mkdir_p "www/javascripts"
  
  src = ""
  
  FileList["lib/plumb.js", "lib/plumb/*.js"].each do |path|
    src += File.read(path) + "\n\n"
  end
  
  tmp = Tempfile.new("plumb")
  tmp << src
  tmp.close
  
  `java -jar vendor/shrinksafe.jar #{tmp.path} > www/javascripts/plumb.js`
end