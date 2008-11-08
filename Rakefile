task :build_javascripts => ["www/javascripts/prototype.js", "www/javascripts/letters.js", "www/javascripts/plumb.js"]

task "www/javascripts/prototype.js" do
  mkdir_p "www/javascripts"
  cp "vendor/prototype.js", "www/javascripts/prototype.js"
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
  
  File.open("www/javascripts/plumb.js", "w+") do |f|
    f << src
  end
end