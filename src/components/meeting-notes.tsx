import { useState, useEffect } from 'react'
import { Textarea } from "@/components/ui/textarea"
import { useFirebase } from '@/hooks/useFirebase'

interface MeetingNotesProps {
  roomId: string
}

export function MeetingNotes({ roomId }: MeetingNotesProps) {
  const [notes, setNotes] = useState('')
  const { getNotes, updateNotes } = useFirebase(roomId)

  useEffect(() => {
    const fetchNotes = async () => {
      const fetchedNotes = await getNotes()
      setNotes(fetchedNotes)
    }
    fetchNotes()
  }, [getNotes])

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value
    setNotes(newNotes)
    updateNotes(newNotes)
  }

  return (
    <div className="space-y-2">
      <Textarea
        placeholder="Type your meeting notes here..."
        value={notes}
        onChange={handleNotesChange}
        className="min-h-[200px]"
      />
    </div>
  )
}