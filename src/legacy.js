// Reused from the original AlgoArena (sort + search trace generators)
export function makeSortSteps(arr, algorithm) {
  const a = [...arr], steps = [];
  const add = (line, active=[], compared=[], swaps=0, kind='compare') => steps.push({array:[...a],line,active,compared,swaps,kind});
  if (algorithm === 'Insertion Sort') {
    add('Start with the first element as a sorted section.',[0],[],0,'start');
    for(let i=1;i<a.length;i++){
      const key=a[i]; let j=i-1;
      add(`Pick key ${key} and compare it with the sorted section.`,[i],[],0,'key');
      while(j>=0){
        add(`Compare ${a[j]} with key ${key}.`,[j,i],[j,i],0,'compare');
        if(a[j]>key){a[j+1]=a[j];add(`${a[j]} is larger, so shift it one position right.`,[j,j+1],[],0,'shift');j--;}
        else break;
      }
      a[j+1]=key;add(`Insert ${key} at position ${j+1}.`,[j+1],[],0,'insert');
    }
  } else if (algorithm === 'Quick Sort') {
    const partition=(lo,hi)=>{
      const pivot=a[hi];let i=lo-1;add(`Choose ${pivot} as the pivot for this section.`,[hi],[],0,'pivot');
      for(let j=lo;j<hi;j++){
        add(`Compare ${a[j]} with pivot ${pivot}.`,[j,hi],[j,hi],0,'compare');
        if(a[j]<pivot){i++;if(i!==j){[a[i],a[j]]=[a[j],a[i]];add(`Swap ${a[i]} and ${a[j]} to move a smaller value left.`,[i,j],[],1,'swap');}}
      }
      if(i+1!==hi){[a[i+1],a[hi]]=[a[hi],a[i+1]];add(`Place pivot ${pivot} in its final position.`,[i+1,hi],[],1,'swap');}
      else add(`Pivot ${pivot} is already in its final position.`,[hi],[],0,'pivot');
      return i+1;
    };
    const sort=(lo,hi)=>{if(lo>=hi)return;const p=partition(lo,hi);sort(lo,p-1);sort(p+1,hi)};
    add('Quick sort starts by partitioning around a pivot.',[],[],0,'start');sort(0,a.length-1);
  } else {
    const merge=(lo,mid,hi)=>{
      const left=a.slice(lo,mid+1),right=a.slice(mid+1,hi+1);let i=0,j=0,k=lo;
      add(`Merge sorted sections [${left.join(', ')}] and [${right.join(', ')}].`,Array.from({length:hi-lo+1},(_,x)=>lo+x),[],0,'merge');
      while(i<left.length&&j<right.length){
        add(`Compare ${left[i]} and ${right[j]}; take the smaller value.`,[k],[lo+i,mid+1+j],0,'compare');
        a[k++]=left[i]<=right[j]?left[i++]:right[j++];
        add('Write the next value into the merged section.',[k-1],[],0,'write');
      }
      while(i<left.length){a[k]=left[i++];add('Copy the remaining left value.',[k],[],0,'write');k++}
      while(j<right.length){a[k]=right[j++];add('Copy the remaining right value.',[k],[],0,'write');k++}
      add(`Merged section is now [${a.slice(lo,hi+1).join(', ')}].`,Array.from({length:hi-lo+1},(_,x)=>lo+x),[],0,'done');
    };
    const sort=(lo,hi)=>{if(lo>=hi)return;const mid=Math.floor((lo+hi)/2);add(`Split range ${lo}–${hi} into ${lo}–${mid} and ${mid+1}–${hi}.`,Array.from({length:hi-lo+1},(_,x)=>lo+x),[],0,'split');sort(lo,mid);sort(mid+1,hi);merge(lo,mid,hi)};
    add('Merge sort begins by dividing the array into smaller ranges.',[],[],0,'start');sort(0,a.length-1);
  }
  add('Finished! The array is sorted in ascending order.',a.map((_,i)=>i),[],0,'done');
  return steps;
}
export function makeSearchSteps(arr, algorithm, target) {
  const a=[...arr].sort((x,y)=>x-y),steps=[];
  if(algorithm==='Linear Search'){
    for(let i=0;i<a.length;i++){steps.push({array:a,line:`Compare target ${target} with ${a[i]} at index ${i}.`,active:[i],compared:[i],kind:'compare',found:a[i]===target});if(a[i]===target){steps.push({array:a,line:`Found ${target} at index ${i}!`,active:[i],kind:'done',found:true});return steps}}
    steps.push({array:a,line:`${target} is not present in this array.`,active:[],kind:'done',found:false});
  } else {
    let l=0,r=a.length-1;
    while(l<=r){const m=Math.floor((l+r)/2);steps.push({array:a,line:`Check middle index ${m}: ${a[m]} vs target ${target}.`,active:[m],compared:[l,r],kind:'compare',low:l,high:r,mid:m,found:a[m]===target});if(a[m]===target){steps.push({array:a,line:`Found ${target} at index ${m}!`,active:[m],kind:'done',found:true});return steps}if(a[m]<target)l=m+1;else r=m-1}
    steps.push({array:a,line:`${target} is not present in this array.`,active:[],kind:'done',found:false});
  }return steps;
}
